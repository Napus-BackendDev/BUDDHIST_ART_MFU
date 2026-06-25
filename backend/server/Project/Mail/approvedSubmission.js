module.exports = function approvedSubmissionMailTemplate({ artistName, submissionTitle, approvalDate }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .email-container {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #8c1515 0%, #d32f2f 100%);
                border-bottom: 4px solid #FEC260;
                color: #ffffff;
                padding: 40px 20px;
                text-align: center;
            }
            .content {
                padding: 30px;
                color: #333333;
                line-height: 1.6;
            }
            .artwork-box {
                background-color: #f9f9f9;
                border-left: 4px solid #FEC260;
                padding: 20px;
                margin: 20px 0;
            }
            .footer {
                background-color: #f4f4f4;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #777777;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>ขอแสดงความยินดีด้วย!</h1>
                <p>ผลงานสร้างสรรค์ของท่านผ่านการอนุมัติแล้ว</p>
            </div>
            <div class="content">
                <p>เรียน คุณ <strong>${artistName}</strong>,</p>
                <p>เรายินดีที่จะแจ้งให้ทราบว่า ผลงานสร้างสรรค์พุทธศิลป์ที่ท่านส่งเข้ามาในระบบ ได้รับการตรวจประเมินและอนุมัติโดยคณะกรรมการเรียบร้อยแล้ว</p>
                
                <div class="artwork-box">
                    <p style="margin: 0;"><strong>ชื่อผลงาน:</strong> ${submissionTitle}</p>
                    <p style="margin: 5px 0 0 0;"><strong>วันที่อนุมัติ:</strong> ${approvalDate}</p>
                </div>

                <p>ขณะนี้ผลงานของท่านได้เข้าสู่ระบบคอลเลกชันหลักของโครงการพุทธศิลปกรรม มฟล. เรียบร้อยแล้ว และจะได้รับการเผยแพร่จัดแสดงให้แก่ผู้เยี่ยมชมและผู้สนใจเช่าบูชาต่อไป</p>
                
                <p>ขอขอบพระคุณสำหรับความคิดสร้างสรรค์และผลงานอันทรงคุณค่าที่ท่านได้ร่วมสืบสานพุทธศิลป์</p>
                
                <p>ขอแสดงความนับถือ<br/><strong>ทีมงานพุทธศิลปกรรม มฟล. (Buddhist Art MFU Curator Team)</strong></p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Buddhist Art MFU. All rights reserved.</p>
                <p>มหาวิทยาลัยแม่ฟ้าหลวง จังหวัดเชียงราย ประเทศไทย</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
