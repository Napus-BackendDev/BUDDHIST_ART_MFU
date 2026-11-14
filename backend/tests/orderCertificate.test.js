jest.mock('../server/Project/Order/controller/order', () => ({ onQuery: jest.fn(), onUpdate: jest.fn() }));
jest.mock('../helpers/google/Mail', () => ({ sendMail: jest.fn() }));
jest.mock('../helpers/pdf.service', () => ({ generateCertificateOfAuthenticity: jest.fn() }));
jest.mock('../helpers/mfuDrive', () => ({ isEnabled: () => true, relativePathFromStoredUrl: () => null }));
jest.mock('../server/Project/Submission/service/image', () => ({ getImageBuffer: jest.fn() }));
jest.mock('../server/Project/Settings/service/message', () => ({ sendResponse: jest.fn((res, group, code, message) => res.send({ code, message })) }));

const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const Order = require('../server/Project/Order/controller/order');
const PdfService = require('../helpers/pdf.service');
const { getImageBuffer } = require('../server/Project/Submission/service/image');
const { onDownloadCertificate } = require('../server/Project/Order/service/order');
const orderId = '6ad089eb403a7d51acae176c';
let certificate;
let response;

beforeAll(async () => {
    const pdf = await PDFDocument.create();
    pdf.addPage();
    certificate = Buffer.from(await pdf.save());
});
beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    response = { setHeader: jest.fn(), send: jest.fn() };
    Order.onUpdate.mockResolvedValue({});
    Order.onQuery.mockResolvedValue({ _id: orderId, orderNumber: 'TEST', status: { title: [{ key: 'en', value: 'Approved' }] }, artwork: [
        { image: 'https://mfudrive.mfu.ac.th/public.php/dav/files/old-share/large.png', title: [{ key: 'en', value: 'First' }] },
        { image: 'https://drive.google.com/thumbnail?id=imported', title: [{ key: 'en', value: 'Second' }] }
    ] });
    getImageBuffer.mockResolvedValue(Buffer.from('validated-jpeg'));
    PdfService.generateCertificateOfAuthenticity.mockResolvedValue(certificate);
});
afterEach(() => jest.restoreAllMocks());

test('includes every imported artwork using the bounded image reader and completes the certificate', async () => {
    await onDownloadCertificate({ params: { id: orderId } }, response);
    const pdf = await PDFDocument.load(response.send.mock.calls[0][0]);
    expect(pdf.getPageCount()).toBe(2);
    expect(getImageBuffer).toHaveBeenCalledTimes(2);
    expect(PdfService.generateCertificateOfAuthenticity.mock.calls[0][0]).toMatchObject({ artworkBuffer: Buffer.from('validated-jpeg') });
    expect(Order.onUpdate).toHaveBeenCalledWith({ _id: orderId }, { certificateStatus: 'Completed', certificateError: '' });
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
});

test('downloads an approved certificate after the status title is renamed', async () => {
    const doc = await Order.onQuery();
    doc.status = { code: 'APPROVED', title: [{ key: 'en', value: 'QA confirmed collection' }] };
    Order.onQuery.mockResolvedValue(doc);
    await onDownloadCertificate({ params: { id: orderId } }, response);
    const pdf = await PDFDocument.load(response.send.mock.calls[0][0]);
    expect(pdf.getPageCount()).toBe(2);
    expect(PdfService.generateCertificateOfAuthenticity).toHaveBeenCalledTimes(2);
});

test.each(['RESERVED', 'PENDING', 'REJECTED', 'CANCELLED'])('does not issue a certificate for canonical %s even if its title says Approved', async code => {
    const doc = await Order.onQuery();
    doc.status = { code, title: [{ key: 'en', value: 'Approved' }] };
    Order.onQuery.mockResolvedValue(doc);
    await onDownloadCertificate({ params: { id: orderId } }, response);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({ code: 40300 }));
    expect(PdfService.generateCertificateOfAuthenticity).not.toHaveBeenCalled();
    expect(getImageBuffer).not.toHaveBeenCalled();
    expect(Order.onUpdate).not.toHaveBeenCalled();
});

test('keeps local artwork images working without a remote download', async () => {
    const doc = await Order.onQuery();
    doc.artwork = [{ image: '/uploads/certificate-test.jpg' }];
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'statSync').mockReturnValue({ isFile: () => true });
    await onDownloadCertificate({ params: { id: orderId } }, response);
    expect(getImageBuffer).not.toHaveBeenCalled();
    expect(PdfService.generateCertificateOfAuthenticity.mock.calls[0][0].artworkPath).toBeTruthy();
});

test('fails rather than sending an incomplete certificate if one artwork image is unavailable', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    getImageBuffer.mockResolvedValueOnce(Buffer.from('validated-jpeg')).mockRejectedValueOnce(new Error('Image unavailable'));
    await onDownloadCertificate({ params: { id: orderId } }, response);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({ code: 40400 }));
    expect(Order.onUpdate).toHaveBeenCalledWith({ _id: orderId }, { certificateStatus: 'Failed', certificateError: 'Image unavailable' });
});

test('does not generate certificates for unapproved orders', async () => {
    const doc = await Order.onQuery();
    doc.status = { title: [{ key: 'en', value: 'Pending' }] };
    await onDownloadCertificate({ params: { id: orderId } }, response);
    expect(response.send).toHaveBeenCalledWith(expect.objectContaining({ code: 40300 }));
    expect(getImageBuffer).not.toHaveBeenCalled();
    expect(PdfService.generateCertificateOfAuthenticity).not.toHaveBeenCalled();
});

test('renders fallback placeholder instead of crashing when an artwork in the order has null image', async () => {
    const doc = await Order.onQuery();
    doc.artwork = [{ image: null, title: [{ key: 'th', value: 'ไม่มีรูป' }] }];
    Order.onQuery.mockResolvedValue(doc);
    await onDownloadCertificate({ params: { id: orderId } }, response);
    expect(getImageBuffer).not.toHaveBeenCalled();
    expect(PdfService.generateCertificateOfAuthenticity).toHaveBeenCalledWith(expect.objectContaining({ artworkBuffer: null }));
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
});

test('forwards artwork category to certificate generator so 3D categories can render DIMENSION', async () => {
    const doc = await Order.onQuery();
    const category = { code: 'SCULPTURE', title: { en: 'Sculpture', th: 'ประติมากรรม' } };
    doc.artwork = [{ image: null, category, size: [{ key: 'en', value: '30 x 30 x 60 cm' }] }];
    Order.onQuery.mockResolvedValue(doc);
    await onDownloadCertificate({ params: { id: orderId } }, response);
    expect(PdfService.generateCertificateOfAuthenticity).toHaveBeenCalledWith(
        expect.objectContaining({
            info: expect.objectContaining({ category })
        })
    );
});
