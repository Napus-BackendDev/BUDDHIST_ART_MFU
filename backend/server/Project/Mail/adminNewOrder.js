module.exports = function adminNewOrderMailTemplate({ buyerName, orderId, artworkTitle, price, orderDate }) {
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
            .btn-container {
                text-align: center;
                margin: 30px 0;
            }
            .btn-action {
                background-color: #8c1515;
                color: #ffffff !important;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 50px;
                font-weight: bold;
                display: inline-block;
                border-bottom: 3px solid #FEC260;
                transition: background-color 0.2s;
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
                <h1>มีรายการสั่งซื้อใหม่ในระบบ!</h1>
                <p>โปรดตรวจสอบและติดตามการชำระเงินของลูกค้า</p>
            </div>
            <div class="content">
                <p>เรียน <strong>ผู้ดูแลระบบ (Admin)</strong>,</p>
                <p>ระบบตรวจพบว่ามีลูกค้าทำการสั่งซื้อผลงานศิลปะชำระเงินในระบบพุทธศิลปกรรม มฟล. รายละเอียดข้อมูลการจองมีดังนี้:</p>
                
                <table class="order-details">
                    <tr>
                        <td width="35%"><strong>หมายเลขสั่งซื้อ:</strong></td>
                        <td><strong>#${orderId}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>ชื่อผู้สั่งซื้อ:</strong></td>
                        <td>${buyerName}</td>
                    </tr>
                    <tr>
                        <td><strong>ผลงานศิลปะ:</strong></td>
                        <td>${artworkTitle}</td>
                    </tr>
                    <tr>
                        <td><strong>ราคา:</strong></td>
                        <td style="color: #8c1515; font-weight: bold;">฿${Number(price || 0).toLocaleString()} THB</td>
                    </tr>
                    <tr>
                        <td><strong>วันที่จอง:</strong></td>
                        <td>${orderDate}</td>
                    </tr>
                </table>

                <p>โปรดเข้าสู่ระบบแอดมินเพื่อตรวจสอบข้อมูลของลูกค้า หรือรอการอัปโหลดหลักฐานการชำระเงิน (หลักฐานการโอนเงิน) จากทางลูกค้าต่อไป</p>
                
                <div class="btn-container">
                    <a href="http://localhost:8080/admin/orders" class="btn-action">เข้าสู่ระบบแอดมินเพื่อตรวจสอบออเดอร์</a>
                </div>

                <p>ขอแสดงความนับถือ<br/><strong>ระบบแจ้งเตือนอัตโนมัติ - พุทธศิลปกรรม มฟล.</strong></p>
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
