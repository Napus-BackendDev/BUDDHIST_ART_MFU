let capturedHtml = '';
const mockPage = {
  setContent: jest.fn(async (html) => {
    capturedHtml = html;
  }),
  evaluate: jest.fn(async () => {}),
  pdf: jest.fn(async () => Buffer.from('%PDF-1.4\n%mock')),
  close: jest.fn(async () => {}),
};
const mockBrowser = {
  newPage: jest.fn(async () => mockPage),
  close: jest.fn(async () => {}),
};

jest.mock('puppeteer', () => ({
  launch: jest.fn(async () => mockBrowser),
}));

const pdfService = require('../helpers/pdf.service');

describe('PDF feedback templates', () => {
  beforeEach(() => {
    capturedHtml = '';
    jest.clearAllMocks();
  });

  it('renders Reservation Confirmation without payment info or signatures, and includes size & technique', async () => {
    await pdfService.generateInvoice({
      orderNumber: 'ORD-2026-0010',
      orderDate: '10/11/2569',
      customerName: 'ผู้ซื้อ ทดสอบ',
      customerPhone: '0812345678',
      customerEmail: 'buyer@example.com',
      shippingAddress: 'Chiang Rai',
      total: 15000,
      subtotal: 15000,
      shipping: 0,
      items: [
        {
          title: 'ศรัทธาแห่งแสง',
          artist: 'ศิลปิน ทดสอบ',
          size: '60 x 80 ซม.',
          technique: 'สีอะคริลิกบนผ้าใบ',
          price: 15000,
        },
      ],
    });

    expect(capturedHtml).toContain('ใบยืนยันการจองผลงานศิลปะ');
    expect(capturedHtml).not.toContain('ใบสั่งจองผลงานศิลปะ');
    expect(capturedHtml).toContain('<strong>ขนาด:</strong> 60 x 80 ซม.');
    expect(capturedHtml).toContain('<strong>เทคนิค:</strong> สีอะคริลิกบนผ้าใบ');
    expect(capturedHtml).not.toContain('payment-info');
    expect(capturedHtml).not.toContain('signature-section');
    expect(capturedHtml).not.toContain('ผู้จอง / Buyer');
    expect(capturedHtml).not.toContain('เจ้าหน้าที่ผู้รับเงิน / Staff');
    expect(capturedHtml).toContain('การสั่งจองจะสมบูรณ์เมื่อท่านได้รับ E-mail ยืนยันการสั่งซื้อผลงานพุทธศิลปกรรม มหาวิทยาลัยแม่ฟ้าหลวง');
    expect(capturedHtml).toContain('การจัดส่ง มหาวิทยาลัยจะดำเนินการประสานการจัดส่งผลงานตามที่อยู่ที่ระบุข้างต้น');
    expect(capturedHtml).toContain('ใบเสร็จรับเงินออกโดยมหาวิทยาลัยแม่ฟ้าหลวง และจัดส่งไปพร้อมกับผลงานตามที่อยู่ที่ระบุข้างต้น');
    expect(capturedHtml).toContain('ไม่มีรูปภาพ');
  });

  it('renders Certificate of Authenticity matching the redesigned ivory layout with centered owner signature line and no seal', async () => {
    await pdfService.generateCertificateOfAuthenticity({
      title: 'Lotus Mind',
      artist: 'Artist Test',
      size: '50 x 70 cm',
      year: '2026',
      technique: 'Oil on canvas',
      artworkCode: 'BA-2569-06-009',
    });

    expect(capturedHtml).toContain('data:image/png;base64,');
    expect(capturedHtml).toContain('CERTIFICATE OF AUTHENTICITY');
    expect(capturedHtml).toContain('#f5f2eb');
    ['ARTWORK TITLE', 'ARTIST', 'YEAR OF CREATION', 'TECHNIQUE', 'SIZE', 'EDITION', 'CERTIFICATE NO.'].forEach((label) => {
      expect(capturedHtml).toContain(label);
    });
    expect(capturedHtml).toContain('Artist Test');
    expect(capturedHtml).toContain('Original work');
    expect(capturedHtml).toContain('Tel 0-5391-7897 to 8036');
    expect(capturedHtml).toContain('www.buddhistartspace.mfu.ac.th');
    expect(capturedHtml).not.toContain('mfuSealTextArc');
    expect(capturedHtml).not.toContain('Art Signatue');
    expect(capturedHtml).not.toContain('Collector Name');
  });

  it('renders DIMENSION instead of SIZE in PDF HTML when artwork category is 3D', async () => {
    await pdfService.generateCertificateOfAuthenticity({
      info: {
        title: 'Sacred Bronze',
        artist: 'Sculptor Test',
        size: '45 x 45 x 90 cm',
        category: { code: 'SCULPTURE', title: { en: 'Sculpture', th: 'ประติมากรรม' } },
        year: '2026',
        technique: 'Bronze casting',
        artworkCode: 'BA-2569-06-010',
      },
    });

    expect(capturedHtml).toContain('>DIMENSION</td>');
    expect(capturedHtml).not.toContain('>SIZE</td>');
    expect(capturedHtml).toContain('45 x 45 x 90 cm');
  });
});
