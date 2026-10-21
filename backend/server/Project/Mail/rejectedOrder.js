module.exports = function rejectedOrderMailTemplate({ buyerName, orderId, artworkTitle, reason }) {
    const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
    buyerName = escapeHtml(buyerName);
    orderId = escapeHtml(orderId);
    artworkTitle = escapeHtml(artworkTitle);
    reason = escapeHtml(reason);
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
            .reason-box {
                padding: 20px;
                background-color: #fff5f5;
                border-left: 4px solid #8c1515;
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
                <h1>โปรดดำเนินการตรวจสอบ</h1>
                <p>เกี่ยวกับใบสั่งซื้อหมายเลข #${orderId}</p>
            </div>
            <div class="content">
                <p>เรียน คุณ <strong>${buyerName}</strong>,</p>
                <p>เราขอแจ้งให้ทราบว่า หลักฐานการชำระเงินที่ท่านส่งมาสำหรับผลงานพุทธศิลป์ <strong>${artworkTitle}</strong> ไม่ผ่านการอนุมัติเนื่องจากเหตุผลต่อไปนี้:</p>
                
                <div class="reason-box">
                    <strong>เหตุผลที่ไม่ผ่านการอนุมัติ:</strong><br/>
                    ${reason || 'หลักฐานการชำระเงินไม่ชัดเจน หรือข้อมูลการโอนเงินไม่ถูกต้อง'}
                </div>

                <p>การจองในคำสั่งซื้อนี้สิ้นสุดแล้ว ไม่สามารถอัปโหลดหลักฐานเพิ่มในคำสั่งซื้อเดิมได้ หากต้องการจองอีกครั้ง โปรดตรวจสอบว่าผลงานยังพร้อมขายก่อนทำรายการจองใหม่ หรือติดต่อทีมงานพุทธศิลปกรรมเพื่อขอรับความช่วยเหลือ</p>
                
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
