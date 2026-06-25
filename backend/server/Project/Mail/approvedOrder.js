module.exports = function approvedOrderMailTemplate({ buyerName, orderId, artworkTitle, price }) {
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
            .order-details {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background-color: #f9f9f9;
                border-radius: 4px;
            }
            .order-details td {
                padding: 15px;
                border-bottom: 1px solid #eeeeee;
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
                <h1>การชำระเงินได้รับการอนุมัติแล้ว!</h1>
                <p>การสั่งซื้อผลงานของท่านเสร็จสมบูรณ์</p>
            </div>
            <div class="content">
                <p>เรียน คุณ <strong>${buyerName}</strong>,</p>
                <p>เรายินดีที่จะแจ้งให้ทราบว่า หลักฐานการชำระเงินสำหรับใบสั่งซื้อหมายเลข <strong>#${orderId}</strong> ได้รับการตรวจสอบและอนุมัติเรียบร้อยแล้ว</p>
                
                <table class="order-details">
                    <tr>
                        <td><strong>ผลงานพุทธศิลป์:</strong></td>
                        <td style="text-align: right;">${artworkTitle}</td>
                    </tr>
                    <tr>
                        <td><strong>ยอดชำระทั้งสิ้น:</strong></td>
                        <td style="text-align: right;">฿${price.toLocaleString()}</td>
                    </tr>
                </table>

                <p>เราได้แนบ <strong>ใบรับรองสิทธิ์และผลงานจริง (Certificate of Authenticity)</strong> สำหรับผลงานของท่านมาพร้อมกับอีเมลฉบับนี้ นอกจากนี้ท่านยังสามารถเข้าสู่ระบบเพื่อดาวน์โหลดใบรับรองได้ตลอดเวลาจากเมนูประวัติการสั่งซื้อบนเว็บไซต์</p>
                
                <p>ทีมจัดส่งของเราจะดำเนินการประสานงานเพื่อส่งมอบผลงานให้ท่านอย่างปลอดภัย และจะแจ้งหมายเลขติดตามพัสดุ (Tracking number) ให้ทราบโดยเร็วที่สุด</p>
                
                <p>ขอขอบพระคุณเป็นอย่างสูงที่ร่วมสนับสนุนโครงการพุทธศิลปกรรม มหาวิทยาลัยแม่ฟ้าหลวง</p>
                
                <p>ขอแสดงความนับถือ<br/><strong>ทีมงานพุทธศิลปกรรม มฟล. (Buddhist Art MFU Team)</strong></p>
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
