module.exports = function confirmationOrderMailTemplate({ buyerName, orderId, artworkTitle, price, orderDate }) {
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
            }
            .order-details th {
                text-align: left;
                padding: 10px;
                border-bottom: 2px solid #eeeeee;
                color: #777777;
                font-size: 12px;
                text-transform: uppercase;
            }
            .order-details td {
                padding: 15px 10px;
                border-bottom: 1px solid #eeeeee;
            }
            .total-row td {
                font-size: 18px;
                font-weight: bold;
                border-bottom: none;
                padding-top: 20px;
            }
            .footer {
                background-color: #f4f4f4;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #777777;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                background-color: #e8f5e9;
                color: #2e7d32;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>ขอขอบพระคุณเป็นอย่างยิ่ง!</h1>
                <p>เราได้รับคำสั่งซื้อ/จองผลงานของท่านเรียบร้อยแล้ว</p>
            </div>
            <div class="content">
                <p>เรียน คุณ <strong>${buyerName}</strong>,</p>
                <p>การจองผลงานสร้างสรรค์ของท่านเสร็จสมบูรณ์แล้ว ขณะนี้ระบบกำลังบันทึกรายการสำหรับผลงานดังต่อไปนี้:</p>
                
                <table class="order-details">
                    <thead>
                        <tr>
                            <th>รายการรายละเอียด</th>
                            <th style="text-align: right;">จำนวนเงิน</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>${artworkTitle}</strong><br>
                                <span style="font-size: 12px; color: #777777;">รหัสใบสั่งซื้อ: ${orderId}</span>
                            </td>
                            <td style="text-align: right;">฿${Number(price || 0).toLocaleString()}</td>
                        </tr>
                        <tr class="total-row">
                            <td style="text-align: right;">ยอดรวมทั้งสิ้น:</td>
                            <td style="text-align: right; color: #2c3e50;">฿${Number(price || 0).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="text-align: center; margin: 30px 0;">
                    <span class="status-badge">ยืนยันคำสั่งซื้อจองสำเร็จ - ${orderDate}</span>
                </div>

                <p>กรุณาดำเนินการชำระเงินและอัปโหลดสลิปหลักฐานการโอนเงินภายใน 24 ชั่วโมง เพื่อป้องกันรายการจองหมดอายุ หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อทีมงานได้โดยตรงด้วยการตอบกลับอีเมลฉบับนี้</p>
                
                <p>ขอแสดงความนับถือ,<br/><strong>โครงการพุทธศิลปกรรม มฟล.</strong></p>
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