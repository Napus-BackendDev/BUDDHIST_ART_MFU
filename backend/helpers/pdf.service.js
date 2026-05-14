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
            const logoFilePath = path.resolve(__dirname, '../public/assets/img/logo.png');
            let logoBase64 = '';
            if (fs.existsSync(logoFilePath)) {
                const logoData = fs.readFileSync(logoFilePath);
                const contentType = 'image/png';
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
                        width: 200px;
                        height: 80px;
                        background-image: url('${logoBase64}');
                        background-size: contain;
                        background-repeat: no-repeat;
                        background-position: left center;
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
                    <div class="logo"></div>
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
                        <div style="height: 50px;"></div>
                        (ลงชื่อ)............................................................ ผู้สั่งจอง<br/>
                        ( ${data.customerName || '............................................................'} )
                    </div>
                    <div class="signature-box">
                        <img src="${signBase64}" class="signature-image" /><br/>
                        (ลงชื่อ)............................................................<br/>
                        ( นาย ณภัทร เสมือนโพธิ์ )<br/>
                        เจ้าหน้าที่/ผู้รับจอง
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

    /**
     * Generate a PDF Certificate of Authenticity using Puppeteer
     * @param {Object} data - Certificate data (artwork, artist, etc.)
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async generateCertificate(data) {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();

            // Load logo and convert to Base64
            const logoFilePath = path.resolve(__dirname, '../public/assets/img/logo.png');
            let logoBase64 = '';
            if (fs.existsSync(logoFilePath)) {
                const logoData = fs.readFileSync(logoFilePath);
                logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
            }

            // Load signature and convert to Base64
            const signFilePath = path.join(__dirname, '../public/system/Signature/sign.png');
            let signBase64 = '';
            if (fs.existsSync(signFilePath)) {
                const signData = fs.readFileSync(signFilePath);
                signBase64 = `data:image/png;base64,${signData.toString('base64')}`;
            }

            // Load artwork image and convert to Base64
            let artworkBase64 = '';
            if (data.artworkPath && fs.existsSync(data.artworkPath)) {
                const artworkData = fs.readFileSync(data.artworkPath);
                const ext = path.extname(data.artworkPath).toLowerCase() === '.png' ? 'png' : 'jpeg';
                artworkBase64 = `data:image/${ext};base64,${artworkData.toString('base64')}`;
            }

            const fontPath = `file://${path.join(__dirname, '../public/assets/fonts/mfu.ttf').replace(/\\/g, '/')}`;

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
                        font-family: 'MFUFont', serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-color: #fff;
                    }
                    .certificate-container {
                        width: 90%;
                        height: 90%;
                        border: 15px double #8c1515;
                        padding: 40px;
                        position: relative;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }
                    .gold-inner-border {
                        position: absolute;
                        top: 5px; left: 5px; right: 5px; bottom: 5px;
                        border: 2px solid #d4af37;
                        pointer-events: none;
                    }
                    .header-logo {
                        width: 150px;
                        height: 60px;
                        background-image: url('${logoBase64}');
                        background-size: contain;
                        background-repeat: no-repeat;
                        background-position: center;
                        margin-bottom: 20px;
                    }
                    .cert-title {
                        font-size: 42px;
                        color: #8c1515;
                        margin: 10px 0;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .cert-subtitle {
                        font-size: 20px;
                        color: #444;
                        margin-bottom: 30px;
                        font-style: italic;
                    }
                    .content-wrapper {
                        display: flex;
                        width: 100%;
                        justify-content: space-around;
                        align-items: flex-start;
                        margin-top: 20px;
                    }
                    .artwork-preview-box {
                        width: 300px;
                        height: 400px;
                        border: 1px solid #ddd;
                        padding: 10px;
                        background: #fdfdfd;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        display: flex;
                        flex-direction: column;
                    }
                    .artwork-img {
                        width: 100%;
                        height: 250px;
                        object-fit: contain;
                        margin-bottom: 15px;
                    }
                    .artwork-details-mini {
                        font-size: 14px;
                        text-align: left;
                        line-height: 1.6;
                        color: #555;
                    }
                    .info-column {
                        flex: 1;
                        padding: 0 40px;
                        text-align: left;
                    }
                    .info-item {
                        margin-bottom: 15px;
                        border-bottom: 1px dotted #ccc;
                        padding-bottom: 5px;
                    }
                    .info-label {
                        font-weight: bold;
                        color: #8c1515;
                        font-size: 14px;
                        text-transform: uppercase;
                    }
                    .info-value {
                        font-size: 18px;
                        color: #222;
                    }
                    .description-box {
                        margin-top: 20px;
                        font-size: 14px;
                        font-style: italic;
                        color: #666;
                        line-height: 1.4;
                    }
                    .footer-signatures {
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        margin-top: auto;
                        padding-top: 40px;
                    }
                    .sign-box {
                        width: 200px;
                        text-align: center;
                    }
                    .sign-img {
                        height: 50px;
                        margin-bottom: -10px;
                    }
                    .sign-line {
                        border-top: 1px solid #333;
                        display: block;
                        margin-top: 10px;
                        padding-top: 5px;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="certificate-container">
                    <div class="gold-inner-border"></div>
                    
                    <div class="header-logo"></div>
                    <div class="cert-title">Certificate of Authenticity</div>
                    <div class="cert-subtitle">ใบรับรองผลงานศิลปะชิ้นเอก</div>

                    <div class="content-wrapper">
                        <div class="artwork-preview-box">
                            <img src="${artworkBase64}" class="artwork-img" />
                            <div class="artwork-details-mini">
                                <strong>Title:</strong> ${data.info.artworkNameTH} (${data.info.artworkNameEN})<br/>
                                <strong>Artist:</strong> ${data.info.artistName}<br/>
                                <strong>Year:</strong> ${data.info.year}
                            </div>
                        </div>

                        <div class="info-column">
                            <div class="info-item">
                                <div class="info-label">Medium & Technique</div>
                                <div class="info-value">${data.info.technique}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Dimensions</div>
                                <div class="info-value">${data.info.size}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Current Value</div>
                                <div class="info-value">${data.info.price}</div>
                            </div>
                            <div class="description-box">
                                ${data.info.description || 'This is to certify that the mentioned artwork is an authentic work created by the artist.'}
                            </div>
                        </div>
                    </div>

                    <div class="footer-signatures">
                        <div class="sign-box">
                            <div style="height: 50px;"></div>
                            <span class="sign-line">Artist / Representative</span>
                        </div>
                        <div class="sign-box">
                            <img src="${signBase64}" class="sign-img" /><br/>
                            <span class="sign-line">Director of Buddhist Art MFU</span>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `;

            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: true,
                printBackground: true,
                margin: { top: '0', right: '0', bottom: '0', left: '0' }
            });

            return pdfBuffer;
        } finally {
            await browser.close();
        }
    }
}

module.exports = new PdfService();
