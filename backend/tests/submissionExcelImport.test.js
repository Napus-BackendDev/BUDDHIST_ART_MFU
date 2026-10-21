const ExcelJS = require('exceljs');
const sharp = require('sharp');

const { parseWorkbook, resolveRows, ExcelImportError } = require('../server/Project/Submission/service/excelImport');

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
    test('keeps artwork rows and their images after blank worksheet rows', async () => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await workbookBuffer());
        const worksheet = workbook.worksheets[0];
        worksheet.getRow(4).values = worksheet.getRow(2).values.slice();
        worksheet.getRow(4).getCell(11).value = 'QA-SECOND-ARTIST';
        worksheet.getRow(4).getCell(12).value = 'Second artwork';
        worksheet.addImage(worksheet.getImages()[0].imageId, 'T4:T4');

        const parsed = await parseWorkbook(Buffer.from(await workbook.xlsx.writeBuffer()));
        expect(parsed.rows.map(row => row.rowNumber)).toEqual([2, 4]);
        expect(parsed.rows[1]).toMatchObject({ studentId: 'QA-SECOND-ARTIST', artworkTitleTh: 'Second artwork' });
        expect(parsed.rows.every(row => row.image && row.image.rowNumber === row.rowNumber)).toBe(true);
        expect(parsed.imageCount).toBe(2);
    });

    test('rejects a sparse workbook whose last row exceeds the worksheet limit', async () => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await workbookBuffer({ includeImage: false }));
        workbook.worksheets[0].getRow(1001).values = workbook.worksheets[0].getRow(2).values.slice();
        await expect(parseWorkbook(Buffer.from(await workbook.xlsx.writeBuffer())))
            .rejects.toThrow('Workbook contains more than 1000 rows.');
    });

    test('rejects reversed workbook dates before querying users or committing import', async () => {
        await expect(resolveRows({ rows:[{ rowNumber:2, submissionStartDate:new Date('2026-10-20'), submissionEndDate:new Date('2026-10-16') }] }))
            .rejects.toThrow('End dates must not precede start dates.');
    });
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
