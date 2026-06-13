const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateCertificateImage(data) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 }); 

        const logoFilePath = path.resolve(__dirname, 'public/assets/img/logo.png');
        let logoBase64 = '';
        if (fs.existsSync(logoFilePath)) {
            const logoData = fs.readFileSync(logoFilePath);
            logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
        }

        const fontPath = `file://${path.join(__dirname, 'public/assets/fonts/mfu.ttf').replace(/\\/g, '/')}`;

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
                    position: relative;
                }
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -40%);
                    width: 600px;
                    height: 600px;
                    background-image: url('${logoBase64}');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    opacity: 0.08; 
                    z-index: 0;
                }
                .certificate-container {
                    width: 100%;
                    height: 100%;
                    padding: 50px 80px;
                    position: relative;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 1;
                }
                .header-logo {
                    width: 100px;
                    height: 120px;
                    background-image: url('${logoBase64}');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    margin-bottom: 10px;
                }
                .cert-title {
                    font-size: 24px;
                    color: #000;
                    margin: 5px 0;
                    text-align: center;
                    line-height: 1.4;
                }
                .content-wrapper {
                    display: flex;
                    width: 100%;
                    justify-content: center;
                    align-items: flex-start; /* Align to top in case of long text */
                    margin-top: 30px;
                }
                .artwork-container {
                    width: 250px;
                    height: 330px;
                    border: 4px solid #d4af37;
                    padding: 5px;
                    background-color: #fcfcfc;
                    margin-right: 60px; 
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    flex-shrink: 0; /* Prevent resizing */
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
                    font-size: 20px;
                    line-height: 1.8;
                    color: #000;
                    text-align: left;
                    width: 450px; /* Fixed width to force wrapping */
                }
                .info-row {
                    display: flex;
                    margin-bottom: 10px;
                }
                .info-label {
                    width: 120px;
                    flex-shrink: 0;
                }
                .info-value {
                    flex: 1;
                    /* Keeps long text wrapped cleanly */
                }
                .footer-signatures {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    margin-top: auto;
                    padding: 0 40px;
                    text-align: center;
                    font-size: 18px;
                    line-height: 1.6;
                }
                .sign-box {
                    width: 350px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
            </style>
        </head>
        <body>
            <div class="watermark"></div>
            <div class="certificate-container">
                
                <div class="header-logo"></div>
                <div class="cert-title">
                    เอกสารรับรองผลงานสร้างสรรค์ที่เกิดขึ้น หรือ "ทรัพย์สินทางปัญญาที่รับรอง"<br/>
                    ภายใต้หลักสูตรระยะสั้น สาขาวิชาพุทธศิลปกรรม มหาวิทยาลัยแม่ฟ้าหลวง
                </div>

                <div class="content-wrapper">
                    <!-- Artwork Image Placeholder -->
                    <div class="artwork-container">
                        <div class="artwork-placeholder">
                            ภาพผลงานศิลปะ
                        </div>
                    </div>

                    <!-- Information Block using Flex rows for clean wrapping -->
                    <div class="info-block">
                        <div class="info-row">
                            <div class="info-label">ชื่อศิลปิน</div>
                            <div class="info-value">${data.info.artistName}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">ชื่อผลงาน</div>
                            <div class="info-value">${data.info.artworkNameTH}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">ขนาด</div>
                            <div class="info-value">${data.info.size}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">เทคนิค</div>
                            <div class="info-value">${data.info.technique}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">ราคา</div>
                            <div class="info-value">${data.info.price}</div>
                        </div>
                    </div>
                </div>

                <div class="footer-signatures">
                    <div class="sign-box">
                        <div style="height: 60px;"></div>
                        <div>(อาจารย์ทรงเดช ทิพย์ทอง)</div>
                        <div>อาจารย์ประจำหลักสูตร</div>
                        <div>ผู้รับรองผลงาน</div>
                    </div>
                    <div class="sign-box">
                        <div style="height: 60px;"></div>
                        <div>(${data.info.artistName})</div>
                        <div>ผู้เรียนหลักสูตรระยะสั้น สาขาวิชาพุทธศิลปกรรม</div>
                        <div>มหาวิทยาลัยแม่ฟ้าหลวง รุ่นที่ 5 พ.ศ. 2568</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const outputPath = path.join(__dirname, 'mock_certificate_v5.png');
        await page.screenshot({ path: outputPath, fullPage: true });

        console.log('Image generated successfully at:', outputPath);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

const mockData = {
    info: {
        artworkNameTH: 'พระพุทธรูปปางมารวิชัย (จำลอง)',
        artistName: 'นาย ศิลปิน ทดสอบ',
        year: '2024',
        // Long technique text (~5 lines)
        technique: 'หล่อสำริด (Bronze Casting) ปิดทองคำเปลวแท้ 100% ประดับด้วยอัญมณีและคริสตัลสวารอฟสกี้บริเวณฐานพระพุทธรูป ใช้กรรมวิธีการหล่อแบบโบราณควบคู่กับเทคโนโลยีการเคลือบผิวสมัยใหม่เพื่อความคงทนและสวยงาม',
        size: '30 x 45 x 20 cm',
        price: '70 บาท',
    }
};

generateCertificateImage(mockData);
