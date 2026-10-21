'use strict';

const ExcelJS = require('exceljs');
const hasInvalidSubmissionDates = require('./dateValidation');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const JSZip = require(require.resolve('jszip', { paths: [path.dirname(require.resolve('exceljs'))] }));
const mfuDrive = require('../../../../helpers/mfuDrive');

const Submission = require('../models/submission.model');
const User = require('../../User/models/user.model');
const Category = require('../../Artwork/models/category.model');
const Status = require('../../Settings/models/status.model');
const { STATUS_CODES } = require('../../Settings/statusCodes');

const PUBLIC_ROOT = path.resolve(__dirname, '../../../../public');
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 300 * 1024 * 1024;
const MAX_IMAGE_COUNT = 500;
const MAX_WORKSHEET_ROWS = 1000;
const CLEAR_LONG_EDGE = 1600;
const CLEAR_SHORT_EDGE = 900;
const ALLOWED_IMAGE_FORMATS = new Set(['jpeg', 'jpg', 'png', 'webp', 'gif']);

class ExcelImportError extends Error {
    constructor(message, details = [], statusCode = 400) {
        super(message);
        this.name = 'ExcelImportError';
        this.details = details;
        this.statusCode = statusCode;
    }
}

const scalar = (value) => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value;
    if (typeof value !== 'object') return value;
    if (Object.prototype.hasOwnProperty.call(value, 'result')) return scalar(value.result);
    if (Object.prototype.hasOwnProperty.call(value, 'text')) return scalar(value.text);
    if (Array.isArray(value.richText)) return value.richText.map(item => item.text || '').join('');
    return String(value);
};

const normalizeHeader = value => String(scalar(value) || '').toLowerCase().replace(/\s+/g, '');
const normalizeText = value => String(scalar(value) || '').trim().toLowerCase();
const localized = (value, language) => {
    if (!Array.isArray(value)) return String(value || '');
    return String(value.find(item => item.key === language)?.value || value[0]?.value || '');
};
const bilingual = (th, en) => [
    th ? { key: 'th', value: String(th).trim() } : null,
    en ? { key: 'en', value: String(en).trim() } : null
].filter(Boolean);
const parseDate = value => {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
};
const sanitize = value => String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\.+$/g, '')
    .slice(0, 120) || 'Untitled';
const canonicalExtension = format => format === 'jpeg' ? 'jpg' : format;

async function normalizeWorkbookBuffer(buffer) {
    const probe = buffer.subarray(0, Math.min(buffer.length, 256 * 1024)).toString('utf8');
    if (!probe.includes('<x:workbook') && !probe.includes('Target="/xl/')) return buffer;
    const zip = await JSZip.loadAsync(buffer);
    for (const name of Object.keys(zip.files).filter(fileName => fileName.endsWith('.xml'))) {
        const file = zip.file(name);
        if (!file) continue;
        const original = await file.async('string');
        const normalized = original
            .replace(/xmlns:x="http:\/\/schemas\.openxmlformats\.org\/spreadsheetml\/2006\/main"/g,
                'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"')
            .replace(/<\/?x:/g, match => match.startsWith('</') ? '</' : '<');
        if (normalized !== original) zip.file(name, normalized);
    }
    for (const name of Object.keys(zip.files).filter(fileName => fileName.endsWith('.rels'))) {
        const file = zip.file(name);
        if (!file) continue;
        const original = await file.async('string');
        const relationDir = path.posix.dirname(path.posix.dirname(name));
        const normalized = original.replace(/Target="\/(xl\/[^\"]+)"/g, (_match, target) => {
            const relative = path.posix.relative(relationDir === '.' ? '' : relationDir, target);
            return `Target="${relative}"`;
        });
        if (normalized !== original) zip.file(name, normalized);
    }
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

const getRowValue = (row, headerMap, target) => {
    const normalized = normalizeHeader(target);
    let column = headerMap.get(normalized);
    if (!column) {
        for (const [header, index] of headerMap.entries()) {
            if (header.includes(normalized) || normalized.includes(header)) {
                column = index;
                break;
            }
        }
    }
    return column ? scalar(row.getCell(column).value) : '';
};

async function extractImages(workbook, worksheet) {
    const imagesByRow = new Map();
    const warnings = [];
    let totalImageBytes = 0;
    const drawings = worksheet.getImages();
    if (drawings.length > MAX_IMAGE_COUNT) {
        throw new ExcelImportError(`Workbook contains more than ${MAX_IMAGE_COUNT} embedded images.`);
    }

    for (const drawing of drawings) {
        const media = workbook.getImage(drawing.imageId);
        if (!media || !media.buffer) continue;
        const rowNumber = Math.floor(drawing.range.tl.nativeRow) + 1;
        const buffer = Buffer.from(media.buffer);
        totalImageBytes += buffer.length;
        if (totalImageBytes > MAX_TOTAL_IMAGE_BYTES) {
            throw new ExcelImportError('Embedded images exceed the 300 MB total limit.');
        }
        if (buffer.length > MAX_IMAGE_BYTES) {
            warnings.push({ row: rowNumber, code: 'IMAGE_TOO_LARGE', message: 'Image exceeds 10 MB.' });
            continue;
        }

        let metadata;
        try {
            metadata = await sharp(buffer, { animated: false }).metadata();
        } catch (error) {
            warnings.push({ row: rowNumber, code: 'IMAGE_INVALID', message: 'Embedded image cannot be decoded.' });
            continue;
        }
        const format = canonicalExtension(metadata.format || media.extension || '');
        if (!ALLOWED_IMAGE_FORMATS.has(format)) {
            warnings.push({ row: rowNumber, code: 'IMAGE_FORMAT', message: `Unsupported image format: ${format || 'unknown'}.` });
            continue;
        }
        const width = Number(metadata.width || 0);
        const height = Number(metadata.height || 0);
        const longEdge = Math.max(width, height);
        const shortEdge = Math.min(width, height);
        const image = { buffer, format, width, height, bytes: buffer.length, rowNumber };

        const current = imagesByRow.get(rowNumber);
        if (!current || image.bytes > current.bytes) {
            if (current) warnings.push({ row: rowNumber, code: 'MULTIPLE_IMAGES', message: 'Multiple images found; the largest image was selected.' });
            imagesByRow.set(rowNumber, image);
        }
        if (longEdge < CLEAR_LONG_EDGE || shortEdge < CLEAR_SHORT_EDGE) {
            warnings.push({ row: rowNumber, code: 'LOW_RESOLUTION', message: `Image is ${width}x${height}px; recommended minimum is ${CLEAR_LONG_EDGE}px long edge and ${CLEAR_SHORT_EDGE}px short edge.` });
        }
    }
    return { imagesByRow, warnings };
}

async function parseWorkbook(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new ExcelImportError('Workbook is empty.');
    }
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.load(await normalizeWorkbookBuffer(buffer));
    } catch (error) {
        throw new ExcelImportError('Workbook cannot be read. Please use a valid .xlsx file.');
    }
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new ExcelImportError('Workbook has no worksheet.');
    if (worksheet.rowCount > MAX_WORKSHEET_ROWS) {
        throw new ExcelImportError(`Workbook contains more than ${MAX_WORKSHEET_ROWS} rows.`);
    }

    const headerMap = new Map();
    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, column) => {
        const header = normalizeHeader(cell.value);
        if (header) headerMap.set(header, column);
    });
    const required = ['SubmissionTitleThai', 'SubmissionTitleEng', 'CourseLevel', 'ArtistStudentID', 'ArtworkTitleThai', 'ArtworkTitleEng'];
    const missingHeaders = required.filter(header => !headerMap.has(normalizeHeader(header)));
    if (missingHeaders.length) {
        throw new ExcelImportError('Workbook columns do not match the Submission template.', missingHeaders.map(header => ({ code: 'MISSING_HEADER', header })));
    }

    const { imagesByRow, warnings } = await extractImages(workbook, worksheet);
    const rows = [];
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
        const row = worksheet.getRow(rowNumber);
        const submissionTitleTh = String(getRowValue(row, headerMap, 'SubmissionTitleThai') || '').trim();
        const submissionTitleEn = String(getRowValue(row, headerMap, 'SubmissionTitleEng') || '').trim();
        if (!submissionTitleTh && !submissionTitleEn) continue;
        rows.push({
            rowNumber,
            submissionTitleTh,
            submissionTitleEn,
            courseLevel: String(getRowValue(row, headerMap, 'CourseLevel') || '1').trim() || '1',
            academicYear: String(getRowValue(row, headerMap, 'AcademicYear') || (new Date().getFullYear() + 543)).trim(),
            submissionStartDate: parseDate(getRowValue(row, headerMap, 'SubmissionStartDate')),
            submissionEndDate: parseDate(getRowValue(row, headerMap, 'SubmissionEndDate')),
            assignmentTitleTh: String(getRowValue(row, headerMap, 'AssignmentTitleThai') || '').trim(),
            assignmentTitleEn: String(getRowValue(row, headerMap, 'AssignmentTitleEng') || '').trim(),
            assignmentStartDate: parseDate(getRowValue(row, headerMap, 'AssignmentStartDate')),
            assignmentEndDate: parseDate(getRowValue(row, headerMap, 'AssignmentEndDate')),
            studentId: String(getRowValue(row, headerMap, 'ArtistStudentID') || '').trim(),
            artworkTitleTh: String(getRowValue(row, headerMap, 'ArtworkTitleThai') || '').trim(),
            artworkTitleEn: String(getRowValue(row, headerMap, 'ArtworkTitleEng') || '').trim(),
            descriptionTh: String(getRowValue(row, headerMap, 'ArtworkDescriptionThai') || '').trim(),
            descriptionEn: String(getRowValue(row, headerMap, 'ArtworkDescriptionEng') || '').trim(),
            technique: String(getRowValue(row, headerMap, 'Technique') || '').trim(),
            size: String(getRowValue(row, headerMap, 'Size') || '').trim(),
            price: Number(String(getRowValue(row, headerMap, 'Price') || '0').replace(/,/g, '')) || 0,
            category: String(getRowValue(row, headerMap, 'Category') || '').trim(),
            image: imagesByRow.get(rowNumber) || null
        });
    }
    if (!rows.length) throw new ExcelImportError('Workbook contains no valid Submission rows.');
    return {
        rows,
        warnings,
        imageCount: imagesByRow.size,
        hasEmbeddedImageColumn: headerMap.has(normalizeHeader('EmbeddedImage')),
        worksheetName: worksheet.name
    };
}

async function resolveRows(parsed) {
    const invalidDates = parsed.rows.filter(row => hasInvalidSubmissionDates({
        create: { startAt: row.submissionStartDate, endAt: row.submissionEndDate },
        assignments: [{ create: { startAt: row.assignmentStartDate, endAt: row.assignmentEndDate } }]
    }));
    if (invalidDates.length) throw new ExcelImportError('End dates must not precede start dates.', invalidDates.map(row => ({ code: 'INVALID_DATE_RANGE', row: row.rowNumber })));
    const studentIds = [...new Set(parsed.rows.map(row => row.studentId).filter(Boolean))];
    const [users, categories, pendingStatus] = await Promise.all([
        User.find({ studentId: { $in: studentIds } }).lean(),
        Category.find({}).lean(),
        Status.findOne({
            $or: [
                { code: STATUS_CODES.PENDING },
                { 'title.value': { $in: ['Pending', 'รอตรวจสอบ', 'รอตรวจ'] } }
            ]
        }).lean()
    ]);
    const usersByStudentId = new Map(users.map(user => [String(user.studentId || ''), user]));
    const missingStudentIds = studentIds.filter(id => !usersByStudentId.has(id));
    if (missingStudentIds.length) {
        throw new ExcelImportError('Some ArtistStudentID values do not exist in the system.', missingStudentIds.map(studentId => ({ code: 'ARTIST_NOT_FOUND', studentId })));
    }
    if (!pendingStatus) throw new ExcelImportError('Pending artwork status is not configured.');

    const categoryByName = new Map();
    categories.forEach(category => {
        [localized(category.name || category.title, 'th'), localized(category.name || category.title, 'en')]
            .map(normalizeText)
            .filter(Boolean)
            .forEach(name => categoryByName.set(name, category));
    });
    const missingCategories = [...new Set(parsed.rows
        .map(row => row.category)
        .filter(name => name && !categoryByName.has(normalizeText(name))))];
    if (missingCategories.length) {
        throw new ExcelImportError('Some Category values do not exist in the system.', missingCategories.map(category => ({ code: 'CATEGORY_NOT_FOUND', category })));
    }

    const submissions = new Map();
    parsed.rows.forEach(row => {
        const submissionKey = `${normalizeText(row.submissionTitleEn || row.submissionTitleTh)}|${row.courseLevel}|${row.academicYear}`;
        let submission = submissions.get(submissionKey);
        if (!submission) {
            submission = {
                title: bilingual(row.submissionTitleTh, row.submissionTitleEn),
                courseLevel: row.courseLevel,
                academicYear: row.academicYear,
                create: {
                    ...(row.submissionStartDate ? { startAt: row.submissionStartDate } : {}),
                    ...(row.submissionEndDate ? { endAt: row.submissionEndDate } : {})
                },
                artist: [],
                assignments: [],
                _artists: new Set(),
                _assignments: new Map()
            };
            submissions.set(submissionKey, submission);
        }

        const owner = usersByStudentId.get(row.studentId);
        const ownerId = owner?._id.toString();
        const hasArtwork = row.artworkTitleTh || row.artworkTitleEn;
        if (hasArtwork && !owner) throw new ExcelImportError('ArtistStudentID is required for artwork rows.', [{code:'ARTIST_REQUIRED',row:row.rowNumber}]);
        if (ownerId && !submission._artists.has(ownerId)) {
            submission._artists.add(ownerId);
            submission.artist.push(owner._id);
        }
        if (!row.assignmentTitleTh && !row.assignmentTitleEn && !row.assignmentStartDate && !row.assignmentEndDate && !hasArtwork) return;

        const assignmentKey = `${normalizeText(row.assignmentTitleEn || row.assignmentTitleTh)}|${row.assignmentStartDate?.toISOString() || ''}|${row.assignmentEndDate?.toISOString() || ''}`;
        let assignment = submission._assignments.get(assignmentKey);
        if (!assignment) {
            assignment = {
                title: bilingual(row.assignmentTitleTh, row.assignmentTitleEn),
                create: {
                    ...(row.assignmentStartDate ? { startAt: row.assignmentStartDate } : {}),
                    ...(row.assignmentEndDate ? { endAt: row.assignmentEndDate } : {})
                },
                artist: [],
                artworks: [],
                _artists: new Set()
            };
            submission._assignments.set(assignmentKey, assignment);
            submission.assignments.push(assignment);
        }

        if (ownerId && !assignment._artists.has(ownerId)) {
            assignment._artists.add(ownerId);
            assignment.artist.push(owner._id);
        }
        if (row.artworkTitleTh || row.artworkTitleEn) {
            assignment.artworks.push({
                title: bilingual(row.artworkTitleTh, row.artworkTitleEn),
                description: bilingual(row.descriptionTh, row.descriptionEn),
                technique: bilingual(row.technique, row.technique),
                size: bilingual(row.size, row.size),
                price: row.price,
                owner: owner._id,
                category: row.category ? categoryByName.get(normalizeText(row.category))._id : null,
                status: pendingStatus._id,
                create: { at: new Date() },
                _rowNumber: row.rowNumber,
                _owner: owner,
                _image: row.image
            });
        }
    });

    return {
        submissions: [...submissions.values()],
        warnings: parsed.warnings,
        summary: {
            worksheet: parsed.worksheetName,
            rowCount: parsed.rows.length,
            submissionCount: submissions.size,
            assignmentCount: [...submissions.values()].reduce((sum, item) => sum + item.assignments.length, 0),
            artworkCount: [...submissions.values()].reduce((sum, item) => sum + item.assignments.reduce((inner, assignment) => inner + assignment.artworks.length, 0), 0),
            imageCount: parsed.imageCount,
            missingImageRows: parsed.rows.filter(row => (row.artworkTitleTh || row.artworkTitleEn) && !row.image).map(row => row.rowNumber),
            lowResolutionRows: parsed.warnings.filter(item => item.code === 'LOW_RESOLUTION').map(item => item.row)
        }
    };
}

function cleanSubmission(input) {
    return {
        title: input.title,
        courseLevel: input.courseLevel,
        academicYear: input.academicYear,
        create: input.create,
        artist: input.artist,
        assignments: input.assignments.map(assignment => ({
            title: assignment.title,
            create: assignment.create,
            artist: assignment.artist,
            artworks: assignment.artworks.map(artwork => ({
                title: artwork.title,
                description: artwork.description,
                technique: artwork.technique,
                size: artwork.size,
                price: artwork.price,
                owner: artwork.owner,
                category: artwork.category,
                status: artwork.status,
                create: artwork.create
            }))
        }))
    };
}

async function saveImage(request, context, image) {
    if (!image) return null;
    const owner = context.owner;
    const artistFolder = `${sanitize(owner.studentId || owner._id)}_${sanitize(localized(owner.name, 'en') || localized(owner.name, 'th') || 'Artist')}`;
    const relativeParts = [
        'account', 'Artist', artistFolder, 'Submission',
        sanitize(context.submissionTitle),
        sanitize(context.assignmentTitle)
    ];
    const directory = path.join(PUBLIC_ROOT, ...relativeParts);
    await fs.mkdir(directory, { recursive: true });
    const rowSuffix = context.rowNumber ? `_${context.rowNumber}` : '';
    const filename = `${sanitize(context.artworkTitle)}${rowSuffix}.${image.format}`;
    const absolutePath = path.join(directory, filename);
    await fs.writeFile(absolutePath, image.buffer);
    const webPath = [...relativeParts, filename].join('/');
    let url = `${request.protocol}://${request.get('host')}/${webPath}`;
    if (mfuDrive.isEnabled()) {
        const contentType = image.format === 'jpg' || image.format === 'jpeg'
            ? 'image/jpeg'
            : `image/${image.format}`;
        const uploaded = await mfuDrive.uploadLocalFile(webPath, absolutePath, contentType);
        url = uploaded.url;
    }
    return {
        absolutePath,
        url
    };
}

const titleMatches = (left, right) => {
    const leftNames = [localized(left, 'th'), localized(left, 'en')].map(normalizeText).filter(Boolean);
    const rightNames = [localized(right, 'th'), localized(right, 'en')].map(normalizeText).filter(Boolean);
    return leftNames.some(name => rightNames.includes(name));
};

async function commitImport(request, resolved) {
    const writtenFiles = [];
    const documents = [];
    let createdSubmissions = 0;
    let updatedSubmissions = 0;
    let imagesSaved = 0;
    const unmatchedExistingArtworkRows = [];

    try {
        for (const parsedSubmission of resolved.submissions) {
            const names = parsedSubmission.title.map(item => item.value).filter(Boolean);
            let document = await Submission.findOne({
                courseLevel: parsedSubmission.courseLevel,
                academicYear: parsedSubmission.academicYear,
                'title.value': { $in: names }
            });

            if (!document) {
                document = new Submission(cleanSubmission(parsedSubmission));
                for (let assignmentIndex = 0; assignmentIndex < parsedSubmission.assignments.length; assignmentIndex += 1) {
                    const sourceAssignment = parsedSubmission.assignments[assignmentIndex];
                    for (let artworkIndex = 0; artworkIndex < sourceAssignment.artworks.length; artworkIndex += 1) {
                        const sourceArtwork = sourceAssignment.artworks[artworkIndex];
                        const saved = await saveImage(request, {
                            owner: sourceArtwork._owner,
                            submissionTitle: localized(parsedSubmission.title, 'th') || localized(parsedSubmission.title, 'en'),
                            assignmentTitle: localized(sourceAssignment.title, 'th') || localized(sourceAssignment.title, 'en'),
                            artworkTitle: localized(sourceArtwork.title, 'th') || localized(sourceArtwork.title, 'en'),
                            rowNumber: sourceArtwork._rowNumber
                        }, sourceArtwork._image);
                        if (saved) {
                            document.assignments[assignmentIndex].artworks[artworkIndex].image = saved.url;
                            writtenFiles.push(saved.absolutePath);
                            imagesSaved += 1;
                        }
                    }
                }
                await document.save();
                createdSubmissions += 1;
            } else {
                for (const sourceAssignment of parsedSubmission.assignments) {
                    const targetAssignment = document.assignments.find(item => titleMatches(item.title, sourceAssignment.title));
                    if (!targetAssignment) {
                        sourceAssignment.artworks.forEach(item => unmatchedExistingArtworkRows.push(item._rowNumber));
                        continue;
                    }
                    const usedTargetArtworkIds = new Set();
                    for (const sourceArtwork of sourceAssignment.artworks) {
                        const ownerId = sourceArtwork.owner.toString();
                        const targetArtwork = targetAssignment.artworks.find(item =>
                            !usedTargetArtworkIds.has(String(item._id))
                            && titleMatches(item.title, sourceArtwork.title)
                            && String(item.owner || '') === ownerId
                        );
                        if (!targetArtwork) {
                            unmatchedExistingArtworkRows.push(sourceArtwork._rowNumber);
                            continue;
                        }
                        usedTargetArtworkIds.add(String(targetArtwork._id));
                        const saved = await saveImage(request, {
                            owner: sourceArtwork._owner,
                            submissionTitle: localized(document.title, 'th') || localized(document.title, 'en'),
                            assignmentTitle: localized(targetAssignment.title, 'th') || localized(targetAssignment.title, 'en'),
                            artworkTitle: localized(targetArtwork.title, 'th') || localized(targetArtwork.title, 'en'),
                            rowNumber: sourceArtwork._rowNumber
                        }, sourceArtwork._image);
                        if (saved) {
                            targetArtwork.image = saved.url;
                            writtenFiles.push(saved.absolutePath);
                            imagesSaved += 1;
                        }
                    }
                }
                await document.save();
                updatedSubmissions += 1;
            }
            documents.push(document);
        }
    } catch (error) {
        await Promise.all(writtenFiles.map(file => fs.unlink(file).catch(() => undefined)));
        throw error;
    }

    return {
        documents,
        summary: {
            ...resolved.summary,
            createdSubmissions,
            updatedSubmissions,
            imagesSaved,
            unmatchedExistingArtworkRows: [...new Set(unmatchedExistingArtworkRows)].sort((a, b) => a - b)
        },
        warnings: resolved.warnings
    };
}

async function processWorkbook(buffer, request, options = {}) {
    const parsed = await parseWorkbook(buffer);
    if (!options.dryRun && parsed.hasEmbeddedImageColumn && parsed.rows.length > 0 && parsed.imageCount === 0) {
        throw new ExcelImportError('ไม่พบรูปภาพฝังในไฟล์ Excel นี้ ไฟล์อาจถูก Export ผ่าน Google Sheets ซึ่งจะตัดรูปภาพออก กรุณาใช้ไฟล์ .xlsx ต้นฉบับที่มีรูปภาพฝังอยู่');
    }
    const resolved = await resolveRows(parsed);
    if (options.dryRun) return { documents: [], summary: resolved.summary, warnings: resolved.warnings };
    return commitImport(request, resolved);
}

module.exports = {
    ExcelImportError,
    parseWorkbook,
    resolveRows,
    processWorkbook,
    constants: { MAX_IMAGE_BYTES, MAX_TOTAL_IMAGE_BYTES, MAX_IMAGE_COUNT, MAX_WORKSHEET_ROWS, CLEAR_LONG_EDGE, CLEAR_SHORT_EDGE }
};
