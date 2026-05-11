const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class PdfService {
    /**
     * Generate a PDF invoice using Puppeteer
     * @param {Object} data - Invoice data (order, customer, items)
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async generateInvoice(data) {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();

            // Load logo and convert to Base64
            const logoFilePath = path.join(__dirname, '../public/assets/img/logo.svg');
            let logoBase64 = '';
            if (fs.existsSync(logoFilePath)) {
                const logoData = fs.readFileSync(logoFilePath);
                const contentType = 'image/svg+xml';
                logoBase64 = `data:${contentType};base64,${logoData.toString('base64')}`;
            }

            // Load signature and convert to Base64
            const signFilePath = path.join(__dirname, '../public/system/Signature/sign.png');
            let signBase64 = '';
            if (fs.existsSync(signFilePath)) {
                const signData = fs.readFileSync(signFilePath);
                signBase64 = `data:image/png;base64,${signData.toString('base64')}`;
            }

            const fontPath = `file://${path.join(__dirname, '../public/assets/fonts/mfu.ttf').replace(/\\/g, '/')}`;

            // Basic Invoice Template
            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @font-face {
                        font-family: 'MFUFont';
                        src: url('${fontPath}');
                    }
                    body {
                        font-family: 'MFUFont', sans-serif;
                        padding: 40px;
                        color: #333;
                        line-height: 1.5;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 30px;
                    }
                    .logo {
                        height: 80px;
                    }
                    .invoice-title {
                        font-size: 28px;
                        font-weight: bold;
                        color: #8c1515;
                    }
                    .section-title {
                        font-weight: bold;
                        margin-top: 20px;
                        margin-bottom: 10px;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 5px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                        page-break-inside: auto;
                    }
                    thead {
                        display: table-header-group;
                    }
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    th {
                        background-color: #f8f9fa;
                        text-align: left;
                        padding: 12px;
                        border-bottom: 2px solid #dee2e6;
                    }
                    td {
                        padding: 12px;
                        border-bottom: 1px solid #dee2e6;
                        vertical-align: middle;
                    }
                    .artwork-preview {
                        width: 80px;
                        height: 80px;
                        object-fit: cover;
                        border-radius: 4px;
                    }
                    .payment-info, .terms {
                        font-size: 14px;
                        margin-top: 30px;
                        page-break-inside: avoid;
                    }
                    .signature-section {
                        margin-top: 40px;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        page-break-inside: avoid;
                    }
                    .signature-box {
                        text-align: center;
                        width: 45%;
                        position: relative;
                    }
                    .signature-image {
                        height: 50px;
                        margin-bottom: -15px;
                        position: relative;
                        z-index: 1;
                    }
                    .line {
                        border-bottom: 1px dotted #333;
                        margin-bottom: 5px;
                        width: 100%;
                        display: inline-block;
                    }
                    .text-right {
                        text-align: right;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="${logoBase64}" class="logo" />
                    <div class="text-right">
                        <div class="invoice-title">ใบสั่งจองผลงานศิลปะ</div>
                        <div>เลขที่: ${data.orderId || '............'}</div>
                        <div>วันที่: ${new Date().toLocaleDateString('th-TH')}</div>
                    </div>
                </div>

                <div class="section-title">ข้อมูลผู้สั่งจอง (Customer Information)</div>
                <div>ชื่อ-นามสกุล: ${data.customerName || '............................................................'}</div>
                <div>ที่อยู่: ${data.customerAddress || '........................................................................................................................'}</div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 120px;">รูปภาพ</th>
                            <th>รายละเอียด</th>
                            <th style="width: 120px;" class="text-right">ราคา</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td><img src="${item.image}" class="artwork-preview" /></td>
                                <td>
                                    <strong>ชื่อผลงาน:</strong> ${item.title}<br/>
                                    <strong>ศิลปิน:</strong> ${item.artist}
                                </td>
                                <td class="text-right">${Number(item.price).toLocaleString()} บาท</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" class="text-right"><strong>รวมทั้งสิ้น (Grand Total)</strong></td>
                            <td class="text-right"><strong>${Number(data.total).toLocaleString()} บาท</strong></td>
                        </tr>
                    </tfoot>
                </table>

                <div class="payment-info">
                    <strong>ช่องทางการชำระเงิน (Payment Methods)</strong><br/>
                    ชื่อบัญชี: มหาวิทยาลัยแม่ฟ้าหลวง (${data.accountName || '............................................................'})<br/>
                    ธนาคาร: ${data.bankName || '............................................................'} เลขที่บัญชี: ${data.accountNo || '...............................................'}
                </div>

                <div class="terms">
                    <strong>ข้อกำหนดและเงื่อนไข (Terms & Conditions)</strong>
                    <ul>
                        <li>การสั่งจองจะสมบูรณ์เมื่อผู้จองชำระเงินและส่งหลักฐานการโอนเงินเรียบร้อยแล้ว</li>
                        <li>การจัดส่ง: ดำเนินการจัดส่งผลงานตามที่อยู่ที่ระบุข้างต้น โดยใช้ระบบ จัดส่งปลายทาง (ผู้ซื้อเป็นผู้รับผิดชอบค่าบริการขนส่งเมื่อได้รับสินค้า)</li>
                        <li>มหาวิทยาลัยจะออกใบเสร็จรับเงินอย่างเป็นทางการหลังจากได้รับชำระเงินครบถ้วน</li>
                    </ul>
                </div>

                <div class="signature-section">
                    <div class="signature-box">
                        <div style="height: 50px;"></div> <!-- Spacer for buyer signature -->
                        <span class="line"></span>
                        (ลงชื่อ)............................................................ ผู้สั่งจอง<br/>
                        ( ${data.customerName || '............................................................'} )
                    </div>
                    <div class="signature-box">
                        <img src="${signBase64}" class="signature-image" /><br/>
                        <span class="line"></span>
                        (ลงชื่อ)............................................................ เจ้าหน้าที่/ผู้รับจอง<br/>
                        ( นาย ณภัทร เสมือนโพธิ์ )
                    </div>
                </div>
            </body>
            </html>
            `;

            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
            });

            return pdfBuffer;
        } finally {
            await browser.close();
        }
    }
}

module.exports = new PdfService();
