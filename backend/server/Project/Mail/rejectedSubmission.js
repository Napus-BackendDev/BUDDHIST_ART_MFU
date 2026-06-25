module.exports = function rejectedSubmissionMailTemplate({ artistName, submissionTitle, reason }) {
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
            .info-box {
                background-color: #f5f5f5;
                border-left: 4px solid #8c1515;
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
                <h1>อัปเดตสถานะการส่งผลงาน</h1>
                <p>สถานะ: ไม่ผ่านการอนุมัติ</p>
            </div>
            <div class="content">
                <p>เรียน คุณ <strong>${artistName}</strong>,</p>
                <p>ขอขอบพระคุณที่ให้ความสนใจส่งผลงานสร้างสรรค์ <strong>"${submissionTitle}"</strong> เข้าร่วมประเมินในระบบพุทธศิลป์ของเรา</p>
                
                <p>หลังจากคณะกรรมการภัณฑารักษ์ได้ทำการพิจารณาอย่างละเอียดแล้ว เรามีความเสียดายที่จะแจ้งให้ทราบว่าผลงานของท่านยังไม่ผ่านเกณฑ์การประเมินเพื่อลงขายในระบบในขณะนี้</p>
                
                ${reason ? `
                <div class="info-box">
                    <p style="margin: 0;"><strong>ข้อคิดเห็น/คำแนะนำจากผู้ทรงคุณวุฒิ:</strong></p>
                    <p style="margin: 5px 0 0 0;">${reason}</p>
                </div>
                ` : ''}

                <p>ผลการประเมินนี้ไม่ได้ระบุถึงระดับคุณภาพฝีมือหรือศักยภาพของท่าน แต่เป็นความสอดคล้องตามเกณฑ์คอลเลกชันและแนวทางจัดแสดงของระบบในปัจจุบันเท่านั้น เราขอเป็นกำลังใจให้ท่านมุ่งมั่นสร้างสรรค์ผลงานต่อไป และยินดีต้อนรับการส่งผลงานชิ้นถัดไปของท่านในอนาคต</p>
                
                <p>ขอแสดงความนับถืออย่างสูง,<br/><strong>ทีมงานพุทธศิลปกรรม มฟล. (Buddhist Art MFU Team)</strong></p>
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
