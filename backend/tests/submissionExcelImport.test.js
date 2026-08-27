const ExcelJS = require('exceljs');
const sharp = require('sharp');

const { parseWorkbook, ExcelImportError } = require('../server/Project/Submission/service/excelImport');

const headers = [
    'SubmissionTitleThai', 'SubmissionTitleEng', 'CourseLevel', 'AcademicYear',
    'SubmissionStartDate', 'SubmissionEndDate', 'AssignmentTitleThai', 'AssignmentTitleEng',
    'AssignmentStartDate', 'AssignmentEndDate', 'ArtistStudentID', 'ArtworkTitleThai',
    'ArtworkTitleEng', 'ArtworkDescriptionThai', 'ArtworkDescriptionEng', 'Technique',
    'Size', 'Price', 'Category', 'EmbeddedImage'
];

async function workbookBuffer({ includeImage = true, customHeaders = headers } = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Submission_Template');
    worksheet.addRow(customHeaders);
    worksheet.addRow([
        'ผลงานรุ่น 5', 'Cohort 5', '5', '2568', '2025-09-01', '2026-05-31',
        'ผลงานศิลปะ', 'Artworks', '2025-09-01', '2026-05-31', '6880000049',
        'ทดสอบ', 'Test artwork', 'คำอธิบาย', 'Description', 'Acrylic', '100 x 100 cm',
        10000, 'Painting', ''
    ]);
    if (includeImage) {
        const imageBuffer = await sharp({
            create: { width: 120, height: 100, channels: 3, background: '#8B2E24' }
        }).png().toBuffer();
        const imageId = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
        worksheet.addImage(imageId, 'T2:T2');
    }
    return Buffer.from(await workbook.xlsx.writeBuffer());
}

describe('Submission embedded-image Excel parser', () => {
    test('maps the original embedded image to its worksheet row', async () => {
        const parsed = await parseWorkbook(await workbookBuffer());
        expect(parsed.rows).toHaveLength(1);
        expect(parsed.imageCount).toBe(1);
        expect(parsed.rows[0].rowNumber).toBe(2);
        expect(parsed.rows[0].image).toMatchObject({ format: 'png', width: 120, height: 100 });
        expect(parsed.rows[0].image.buffer).toBeInstanceOf(Buffer);
        expect(parsed.warnings).toEqual(expect.arrayContaining([
            expect.objectContaining({ row: 2, code: 'LOW_RESOLUTION' })
        ]));
    });

    test('keeps a valid row when no embedded image exists', async () => {
        const parsed = await parseWorkbook(await workbookBuffer({ includeImage: false }));
        expect(parsed.rows).toHaveLength(1);
        expect(parsed.imageCount).toBe(0);
        expect(parsed.rows[0].image).toBeNull();
    });

    test('rejects workbooks that do not use the Submission schema', async () => {
        await expect(parseWorkbook(await workbookBuffer({ customHeaders: ['ArtworkTitleThai'] })))
            .rejects.toBeInstanceOf(ExcelImportError);
    });
});
