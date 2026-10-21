const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const certificateOfAuthenticityMail = require('../server/Project/Mail/certificateOfAuthenticity');

class PdfService {
    constructor() {
        this.browser = null;
    }

    async getBrowser() {
        if (!this.browser || !this.browser.connected) {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        return this.browser;
    }

    /**
     * Generate a PDF invoice using Puppeteer
     * @param {Object} data - Invoice data (order, customer, items)
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async generateInvoice(data) {
        const browser = await this.getBrowser();

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
                    ชื่อบัญชี: ${data.accountName || '............................................................'}<br/>
                    ธนาคาร: ${data.bankName || '............................................................'} เลขที่บัญชี: ${data.accountNo || '...............................................'}
                </div>

                <div class="terms">
                    <strong>ข้อกำหนดและเงื่อนไข (Terms & Conditions)</strong>
                    <ul>
                        <li>การสั่งจองจะสมบูรณ์เมื่อผู้จองชำระเงินและส่งหลักฐานการโอนเงินเรียบร้อยแล้ว</li>
                        <li>การจัดส่ง: ดำเนินการจัดส่งผลงานตามที่อยู่ที่ระบุข้างต้น</li>
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
                        <div style="height: 50px;"></div>
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
            if (typeof page !== 'undefined') {
                await page.close();
            }
        }
    }

    /**
     * Generate the same Certificate of Authenticity layout used in the email body.
     * The artwork is embedded as a data URI so the resulting PDF is self-contained.
     * @param {Object} data - Certificate data and local artwork path
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async generateCertificateOfAuthenticity(data) {
        const browser = await this.getBrowser();
        let page;

        try {
            page = await browser.newPage();

            let imageSrc = '';
            if (Buffer.isBuffer(data?.artworkBuffer)) {
                imageSrc = `data:image/jpeg;base64,${data.artworkBuffer.toString('base64')}`;
            } else if (data?.artworkPath && fs.existsSync(data.artworkPath)) {
                const artworkData = fs.readFileSync(data.artworkPath);
                const extension = path.extname(data.artworkPath).toLowerCase();
                const mimeType = extension === '.png' ? 'image/png' : 'image/jpeg';
                imageSrc = `data:${mimeType};base64,${artworkData.toString('base64')}`;
            }

            const info = data?.info || {};
            const htmlContent = certificateOfAuthenticityMail({
                imageSrc,
                titleEN: info.titleEN || info.artworkNameEN,
                titleTH: info.titleTH || info.artworkNameTH,
                artistEN: info.artistEN || info.artistNameEN,
                artistTH: info.artistTH || info.artistName,
                size: info.size,
                year: info.year,
                techniqueEN: info.techniqueEN || info.technique,
                techniqueTH: info.techniqueTH,
                artworkCode: info.artworkCode
            });

            await page.setContent(htmlContent, { waitUntil: 'load' });

            return await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0', right: '0', bottom: '0', left: '0' }
            });
        } finally {
            if (page) await page.close();
        }
    }

    /**
     * Generate a PDF Certificate of Authenticity using Puppeteer
     * @param {Object} data - Certificate data (artwork, artist, etc.)
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async generateCertificate(data) {
        const browser = await this.getBrowser();

        try {
            const page = await browser.newPage();

            // Load logo and convert to Base64
            const logoFilePath = path.resolve(__dirname, '../public/assets/img/logo.png');
            let logoBase64 = '';
            if (fs.existsSync(logoFilePath)) {
                const logoData = fs.readFileSync(logoFilePath);
                logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
            }

            // Load artwork image and convert to Base64
            let artworkBase64 = '';
            if (data.artworkPath && fs.existsSync(data.artworkPath)) {
                const artworkData = fs.readFileSync(data.artworkPath);
                const ext = path.extname(data.artworkPath).toLowerCase() === '.png' ? 'png' : 'jpeg';
                artworkBase64 = `data:image/${ext};base64,${artworkData.toString('base64')}`;
            }

            const fontPath = `file://${path.join(__dirname, '../public/assets/fonts/mfu.ttf').replace(/\\/g, '/')}`;

            // Dynamic Font Size Calculation for Technique based on character length
            const techLength = data.info.technique ? data.info.technique.length : 0;
            let techFontSize = '20px'; // default
            if (techLength > 150 && techLength <= 250) techFontSize = '18px';
            else if (techLength > 250 && techLength <= 350) techFontSize = '16px';
            else if (techLength > 350) techFontSize = '14px';

            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                    @font-face {
                        font-family: 'MFUFont';
                        src: url('${fontPath}');
                    }
                    html, body {
                        font-family: 'MFUFont', serif;
                        margin: 0;
                        padding: 0;
                        width: 297mm;
                        height: 210mm;
                        overflow: hidden;
                        background-color: #fff;
                        -webkit-print-color-adjust: exact;
                    }
                    .watermark {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 140mm;
                        height: 140mm;
                        background-image: url('${logoBase64}');
                        background-size: contain;
                        background-repeat: no-repeat;
                        background-position: center;
                        opacity: 0.08; 
                        z-index: 0;
                        pointer-events: none;
                    }
                    .certificate-container {
                        width: 297mm;
                        height: 210mm;
                        padding: 30px 60px 40px 60px;
                        position: relative;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-between;
                        z-index: 1;
                        overflow: hidden;
                    }
                    .header-logo {
                        width: 85px;
                        height: 100px;
                        background-image: url('${logoBase64}');
                        background-size: contain;
                        background-repeat: no-repeat;
                        background-position: center;
                        margin-bottom: 5px;
                    }
                    .cert-title {
                        font-size: 22px;
                        color: #000;
                        margin: 5px 0;
                        text-align: center;
                        line-height: 1.4;
                    }
                    .content-wrapper {
                        display: flex;
                        width: 100%;
                        justify-content: center;
                        align-items: flex-start;
                        margin-top: 20px;
                    }
                    .artwork-container {
                        width: 210px;
                        height: 280px;
                        border: 4px solid #d4af37;
                        padding: 5px;
                        background-color: #fcfcfc;
                        margin-right: 40px; 
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        flex-shrink: 0; 
                    }
                    .artwork-img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: scale-down; /* Scales down if too big, but won't scale up if too small */
                    }
                    .artwork-placeholder {
                        width: 100%;
                        height: 100%;
                        background-color: #e9ecef;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        color: #888;
                        font-size: 16px;
                        text-align: center;
                        line-height: 1.5;
                    }
                    .info-block {
                        font-size: 18px;
                        line-height: 1.6;
                        color: #000;
                        text-align: left;
                        width: 400px; 
                    }
                    .info-row {
                        display: flex;
                        margin-bottom: 6px;
                    }
                    .info-label {
                        width: 100px;
                        flex-shrink: 0;
                    }
                    .info-value {
                        flex: 1;
                    }
                    .footer-signatures {
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        margin-top: auto;
                        padding: 0 40px;
                        text-align: center;
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .sign-box {
                        width: 300px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .sign-img {
                        height: 50px;
                        margin-bottom: -10px;
                    }
                </style>
            </head>
            <body>
                <div class="certificate-container">
                    <div class="watermark"></div>
                    
                    <div class="header-logo"></div>
                    <div class="cert-title">
                        เอกสารรับรองผลงานสร้างสรรค์ที่เกิดขึ้น หรือ "ทรัพย์สินทางปัญญาที่รับรอง"<br/>
                        ภายใต้หลักสูตรระยะสั้น สาขาวิชาพุทธศิลปกรรม มหาวิทยาลัยแม่ฟ้าหลวง
                    </div>

                    <div class="content-wrapper">
                        <!-- Artwork Image Placeholder -->
                        <div class="artwork-container">
                            ${artworkBase64 ? '<img src="' + artworkBase64 + '" class="artwork-img" />' : '<div class="artwork-placeholder">ไม่มีรูปผลงาน<br/>(No Image)</div>'}
                        </div>

                        <!-- Information Block -->
                        <div class="info-block">
                            <div class="info-row">
                                <div class="info-label">ชื่อศิลปิน</div>
                                <div class="info-value">${data.info.artistName || '-'}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">ชื่อผลงาน</div>
                                <div class="info-value">${data.info.artworkNameTH || '-'}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">ขนาด</div>
                                <div class="info-value">${data.info.size || '-'}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">เทคนิค</div>
                                <div class="info-value" style="font-size: ${techFontSize}; line-height: 1.5;">${data.info.technique || '-'}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">ราคา</div>
                                <div class="info-value">${data.info.price || '-'}</div>
                            </div>
                        </div>
                    </div>

                    <div class="footer-signatures">
                        <div class="sign-box">
                            <div style="height: 50px;"></div>
                            <div>(อาจารย์ทรงเดช ทิพย์ทอง)</div>
                            <div>อาจารย์ประจำหลักสูตร</div>
                            <div>ผู้รับรองผลงาน</div>
                        </div>
                        <div class="sign-box">
                            <div style="height: 50px;"></div>
                            <div>(${data.info.artistName || '...................................'})</div>
                            <div>ผู้เรียนหลักสูตรระยะสั้น สาขาวิชาพุทธศิลปกรรม</div>
                            <div>มหาวิทยาลัยแม่ฟ้าหลวง รุ่นที่ 5 พ.ศ. 2568</div>
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
            if (typeof page !== 'undefined') {
                await page.close();
            }
        }
    }
}

module.exports = new PdfService();
