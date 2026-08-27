const mongo = require('mongodb');
const Submission = require('../controller/submission');
const SubmissionModel = require('../models/submission.model');
const Status = require('../../Settings/models/status.model');
const Artwork = require("../../Artwork/models/artwork.model");
const User = require("../../User/models/user.model");
const Role = require("../../Settings/models/role.model");
const ResMessage = require("../../Settings/service/message");
const { sendMail } = require("../../../../helpers/google/Mail");
const { approvedSubmissionMail, rejectedSubmissionMail } = require("../../Mail");
const {
    generateArtworkCode,
    generateSubmissionCode
} = require('../../Artwork/service/artworkCode');
const { buildPostTermSale } = require('../../Artwork/service/postTermSale');
const { STATUS_CODES } = require('../../Settings/statusCodes');
const { processWorkbook, ExcelImportError } = require('./excelImport');

/**
 * HELPER FUNCTIONS (Internal)
 */

// Extract artworks from a submission document matching a specific status ID
const getArtworksByStatus = (doc, statusId, previousDoc = null) => {
    if (!doc?.assignments || !statusId) return [];
    const targetId = statusId.toString();
    const previousById = new Map();
    (previousDoc?.assignments || []).forEach(assignment => {
        (assignment.artworks || []).forEach(artwork => {
            previousById.set((artwork._id || artwork).toString(), artwork);
        });
    });

    return doc.assignments.flatMap(assignment => {
        // Get assignment title for metadata
        const assignmentTitle = (assignment.title && assignment.title.find(t => t.key === 'th')?.value) || (assignment.title && assignment.title[0]?.value) || "";

        return (assignment.artworks || [])
            .filter(artwork => {
                const currentId = (artwork.status?._id || artwork.status)?.toString();
                if (currentId !== targetId) return false;
                if (!previousDoc) return true;
                const previous = previousById.get((artwork._id || artwork).toString());
                const previousId = (previous?.status?._id || previous?.status)?.toString();
                return previousId !== targetId;
            })
            .map(artwork => {
                // Convert to plain object if it's a Mongoose document to allow adding temp properties
                const artObj = artwork.toObject ? artwork.toObject() : JSON.parse(JSON.stringify(artwork));
                return {
                    ...artObj,
                    _assignmentTitle: assignmentTitle // Attach assignment title for later use
                };
            });
    });
};

// Process email notifications and listing on Sell Page for approved artworks
const processApprovals = async (doc, approvedArtworks, statuses) => {
    const { Approved, Available, Exhibition } = statuses;
    if (!Approved || approvedArtworks.length === 0) return;

    // Group approved artworks by owner to prevent duplicate emails and wrong assignments
    const ownerMap = new Map();
    approvedArtworks.forEach(art => {
        const ownerId = (art.owner?._id || art.owner)?.toString();
        if (!ownerId) return;
        if (!ownerMap.has(ownerId)) ownerMap.set(ownerId, []);
        ownerMap.get(ownerId).push(art);
    });

    for (const [ownerId, artworks] of ownerMap) {
        const artist = doc.artist.find(a => a._id.toString() === ownerId);
        if (!artist) continue;

        const email = artist.contact?.studentEmail || artist.contact?.personalEmail;

        for (const artwork of artworks) {
            const artworkId = artwork._id ? artwork._id.toString() : 'unknown';

            // `submissionArtworkId` is the stable identity. Two distinct
            // submission artworks may legitimately reuse the same image URL.
            const existing = await Artwork.findOne({ submissionArtworkId: artwork._id });

            if (existing) {
                console.log(`[Submission] Artwork ${artworkId} already published (found by submission artwork ID). Skipping.`);
                continue;
            }

            console.log(`[Submission] Processing NEW approval for Artwork ${artworkId}...`);

            // Send notification ONLY for the newly approved artwork
            if (email) {
                const artistName = (artist.name && artist.name[0]?.value) || "Artist";
                const artworkTitle = (artwork.title && artwork.title[0]?.value) || "Your Artwork";
                const html = approvedSubmissionMail({
                    artistName,
                    submissionTitle: artworkTitle,
                    approvalDate: new Date().toLocaleString()
                });

                try {
                    await sendMail(email, `ผลงานได้รับการอนุมัติ: ${artworkTitle} - พุทธศิลปกรรม มฟล.`, '', html);
                    console.log(`[Submission] Approval email sent to ${email} for: ${artworkTitle}`);
                } catch (mailError) {
                    console.error(`[Submission] Failed to send email to ${email}:`, mailError.message);
                }
            }

            // Publish to main Artwork collection
            const subTitle = (doc.title && doc.title.find(t => t.key === 'th')?.value) || (doc.title && doc.title[0]?.value) || "";
            const assignTitle = artwork._assignmentTitle || "";
            const combinedPiece = subTitle + (assignTitle ? ` - ${assignTitle}` : "");

            const generatedCode = artwork.artworkCode || await generateArtworkCode({
                artist,
                courseLevel: doc.courseLevel,
                academicYear: doc.academicYear
            });

            await SubmissionModel.updateOne(
                { _id: doc._id },
                { $set: { 'assignments.$[assignment].artworks.$[item].artworkCode': generatedCode } },
                { arrayFilters: [
                    { 'assignment.artworks._id': artwork._id },
                    { 'item._id': artwork._id }
                ] }
            );

            const postTermSale = buildPostTermSale(doc.create?.endAt);
            await Artwork.create({
                submissionArtworkId: artwork._id,
                artworkPiece: combinedPiece,
                artworkCode: generatedCode,
                academicYear: String(doc.academicYear || (new Date().getFullYear() + 543)),
                courseLevel: String(doc.courseLevel || '00'),
                image: artwork.image,
                title: artwork.title,
                description: artwork.description,
                remark: artwork.remark,
                artist: ownerId,
                technique: artwork.technique,
                size: artwork.size,
                price: artwork.price || 0,
                category: artwork.category,
                storage: artwork.storage || null,
                storageDetail: artwork.storageDetail || '',
                postTermSale,
                status: {
                    approval: Approved._id,
                    sale: postTermSale.needsReview ? (Exhibition?._id || Available?._id || null) : (Available?._id || null)
                }
            });
            console.log(`[Submission] Successfully published artwork ${artworkId} to main collection.`);
        }
    }
};

// Process email notifications for rejected artworks
const processRejections = async (doc, rejectedArtworks) => {
    if (rejectedArtworks.length === 0) return;

    // Group rejected artworks by owner
    const ownerIds = [...new Set(rejectedArtworks.map(art => (art.owner?._id || art.owner)?.toString()).filter(id => !!id))];

    for (const ownerId of ownerIds) {
        const artist = doc.artist.find(a => a._id.toString() === ownerId);
        if (!artist) continue;

        const email = artist.contact?.studentEmail || artist.contact?.personalEmail;
        if (!email) continue;

        const artistName = (artist.name && artist.name[0]?.value) || "Artist";
        const submissionTitle = (doc.title && doc.title[0]?.value) || "Your Artwork";

        // ดึงเหตุผลจาก artwork ชิ้นแรกที่ถูก Reject (หรือรวมจากหลายชิ้นก็ได้ แต่เบื้องต้นดึงจากตัวแรกที่มีเหตุผล)
        const specificReason = rejectedArtworks.find(art => art.rejectionReason)?.rejectionReason;
        const finalReason = specificReason || "Does not meet our current collection requirements.";

        const html = rejectedSubmissionMail({
            artistName,
            submissionTitle,
            reason: finalReason
        });

        try {
            await sendMail(email, 'แจ้งสถานะการประเมินผลงานสร้างสรรค์ - พุทธศิลปกรรม มฟล.', '', html);
            console.log(`Rejection email sent to ${email}`);
        } catch (mailError) {
            console.error(`[Submission] Failed to send rejection email to ${email}:`, mailError.message);
        }
    }
};

// Handle student status transition (NewStudent -> OldStudent) after deadline
const processStudentStatus = async (doc, statuses, roles) => {
    const { NewStudent, OldStudent } = statuses;
    const { Artist } = roles;
    const now = new Date();
    const endDate = doc.create?.endAt;

    if (!endDate || now <= endDate || !NewStudent || !OldStudent || !Artist || !doc.artist?.length) return false;

    const artistIds = doc.artist.map(artist => artist._id || artist);
    const result = await User.updateMany(
        {
            _id: { $in: artistIds },
            status: NewStudent._id,
            role: Artist?._id
        },
        { status: OldStudent._id }
    );
    return (result?.modifiedCount || result?.nModified || 0) > 0;
};

// Helper to handle transitions for multiple submissions
const checkAndTransitionSubmissions = async (submissions) => {
    if (!submissions) return false;
    const docs = Array.isArray(submissions) ? submissions : [submissions];
    if (docs.length === 0) return false;

    // Fetch NewStudent and OldStudent statuses
    const statusDocs = await Status.find({ $or: [{ code: { $in: [STATUS_CODES.NEW_STUDENT, STATUS_CODES.OLD_STUDENT] } }, { "title.value": { $in: ["NewStudent", "OldStudent"] } }] });
    const statuses = statusDocs.reduce((acc, s) => {
        const titleEn = s.title.find(t => t.key === 'en')?.value;
        if (titleEn) acc[titleEn] = s;
        if (s.code === STATUS_CODES.NEW_STUDENT) acc.NewStudent = s;
        if (s.code === STATUS_CODES.OLD_STUDENT) acc.OldStudent = s;
        return acc;
    }, {});

    // Fetch Artist role
    const roleDocs = await Role.find({ "title.value": "Artist" });
    const roles = roleDocs.reduce((acc, r) => {
        const titleEn = r.title.find(t => t.key === 'en')?.value;
        if (titleEn) acc[titleEn] = r;
        return acc;
    }, {});

    let anyTransitioned = false;
    for (const doc of docs) {
        const transitioned = await processStudentStatus(doc, statuses, roles);
        if (transitioned) {
            anyTransitioned = true;
        }
    }
    return anyTransitioned;
};

// Stamp one stable code per submission. First artist identifies multi-artist
// submissions; artwork codes remain individually scoped per artist.
const ensureSubmissionCode = async (doc) => {
    if (!doc || doc.submissionCode) return doc;

    const firstArtistId = doc.artist?.[0]?._id || doc.artist?.[0];
    const artist = firstArtistId ? await User.findById(firstArtistId).lean() : null;
    const submissionCode = await generateSubmissionCode({
        artist,
        courseLevel: doc.courseLevel
    });

    await SubmissionModel.updateOne(
        { _id: doc._id, $or: [{ submissionCode: null }, { submissionCode: { $exists: false } }] },
        { $set: { submissionCode } }
    );
    doc.submissionCode = submissionCode;
    return doc;
};

/**
 * EXPORTED SERVICE METHODS
 */

exports.onQuery = async (request, response) => {
    try {
        const query = { _id: new mongo.ObjectId(request.body._id) };
        let doc = await Submission.onQuery(query);
        if (doc) {
            const transitioned = await checkAndTransitionSubmissions(doc);
            if (transitioned) {
                doc = await Submission.onQuery(query);
            }
        }
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async (request, response) => {
    try {
        let docs = await Submission.onQuerys(request.query || {});
        const transitioned = await checkAndTransitionSubmissions(docs);
        if (transitioned) {
            docs = await Submission.onQuerys(request.query || {});
        }
        return ResMessage.sendResponse(response, 0, 20000, docs);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async (request, response) => {
    try {
        let doc = await Submission.onCreate(request.body);
        if (doc) {
            if (Array.isArray(doc)) {
                for (const item of doc) await ensureSubmissionCode(item);
            } else {
                doc = await ensureSubmissionCode(doc);
            }
            const transitioned = await checkAndTransitionSubmissions(doc);
            if (transitioned) {
                // onCreate returns an array for bulk create; re-query accordingly so
                // the response reflects the transitioned statuses in both shapes.
                doc = Array.isArray(doc)
                    ? await Submission.onQuerys({ _id: { $in: doc.map(d => d._id) } })
                    : await Submission.onQuery({ _id: doc._id });
            }
        }
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error("Create Error:", err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpdate = async (request, response) => {
    try {
        const query = { _id: new mongo.ObjectId(request.body._id) };
        const previousDoc = await Submission.onQuery(query);
        if (!previousDoc) return ResMessage.sendResponse(response, 0, 40400);
        let doc = await Submission.onUpdate(query, request.body);
        if (!doc) return ResMessage.sendResponse(response, 0, 40400);

        // Backfill shared identifier for legacy submissions on update.
        doc = await ensureSubmissionCode(doc);

        // Fetch all relevant statuses in parallel
        const statusValues = ["Approved", "Rejected", "Available", "Exhibition", "NewStudent", "OldStudent"];
        const statusDocs = await Status.find({ $or: [{ code: { $in: Object.values(STATUS_CODES) } }, { "title.value": { $in: statusValues } }] });

        const statuses = statusDocs.reduce((acc, s) => {
            const titleEn = s.title.find(t => t.key === 'en')?.value;
            if (titleEn) acc[titleEn] = s;
            if (s.code === STATUS_CODES.APPROVED) acc.Approved = s;
            if (s.code === STATUS_CODES.REJECTED) acc.Rejected = s;
            if (s.code === STATUS_CODES.AVAILABLE) acc.Available = s;
            if (s.code === STATUS_CODES.EXHIBITION) acc.Exhibition = s;
            if (s.code === STATUS_CODES.NEW_STUDENT) acc.NewStudent = s;
            if (s.code === STATUS_CODES.OLD_STUDENT) acc.OldStudent = s;
            return acc;
        }, {});

        // Fetch Artist role ID
        const roleDocs = await Role.find({ "title.value": "Artist" });
        const roles = roleDocs.reduce((acc, r) => {
            const titleEn = r.title.find(t => t.key === 'en')?.value;
            if (titleEn) acc[titleEn] = r;
            return acc;
        }, {});

        // Extract artworks by category
        // Approval publication is idempotent and must be retryable if a prior
        // publish/PDF/mail side effect failed after the status was saved.
        const approvedArtworks = getArtworksByStatus(doc, statuses.Approved?._id);
        const rejectedArtworks = getArtworksByStatus(doc, statuses.Rejected?._id, previousDoc);

        // Process various side-effects
        const [_, __, statusTransitioned] = await Promise.all([
            processApprovals(doc, approvedArtworks, statuses),
            processRejections(doc, rejectedArtworks),
            processStudentStatus(doc, statuses, roles)
        ]);

        if (statusTransitioned) {
            doc = await Submission.onQuery(query);
        }

        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error("Update Error:", err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onDelete = async (request, response) => {
    try {
        const query = { _id: new mongo.ObjectId(request.body._id) };
        const doc = await Submission.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onImportExcel = async (request, response) => {
    try {
        if (!request.file?.buffer) {
            return response.status(400).json({ code: '40011', message: 'Workbook file is required.' });
        }
        const dryRun = String(request.body?.dryRun || '').toLowerCase() === 'true';
        const result = await processWorkbook(request.file.buffer, request, { dryRun });
        if (!dryRun && result.documents.length) {
            for (const document of result.documents) await ensureSubmissionCode(document);
            await checkAndTransitionSubmissions(result.documents);
        }
        return response.status(200).json({
            code: 20000,
            data: {
                dryRun,
                summary: result.summary,
                warnings: result.warnings,
                submissionIds: result.documents.map(document => String(document._id))
            }
        });
    } catch (error) {
        if (error instanceof ExcelImportError) {
            return response.status(error.statusCode).json({
                code: '40012',
                message: error.message,
                details: error.details
            });
        }
        console.error('Excel Import Error:', error);
        return response.status(500).json({ code: '50012', message: 'Excel import failed.' });
    }
};

exports.onUpload = async (request, response) => {
    try {
        if (!request.file && !request.files) {
            return ResMessage.sendResponse(response, 0, 40400, "No file uploaded");
        }

        const filename = request.file ? request.file.filename : request.files[0].filename;
        const destination = request.file ? request.file.destination : request.files[0].destination;
        const imagePath = Submission.getImageUrl(request, destination, filename);

        return ResMessage.sendResponse(response, 0, 20000, { url: imagePath });
    } catch (err) {
        console.error("Upload Error:", err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
