module.exports = function rejectedOrderMailTemplate({ buyerName, orderId, artworkTitle, reason }) {
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
                background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
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
                border-left: 4px solid #e74c3c;
                margin: 20px 0;
            }
            .footer {
                background-color: #f4f4f4;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #777777;
            }
            .action-button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #2c3e50;
                color: #ffffff;
                border-radius: 4px;
                text-decoration: none;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Action Required</h1>
                <p>Regarding your order #${orderId}</p>
            </div>
            <div class="content">
                <p>Dear <strong>${buyerName}</strong>,</p>
                <p>We are writing to inform you that we could not approve your payment verification for the artwork: <strong>${artworkTitle}</strong>.</p>
                
                <div class="reason-box">
                    <strong>Reason for rejection:</strong><br/>
                    ${reason || 'The provided payment evidence was unclear or could not be verified.'}
                </div>

                <p>Please log in to your account to re-upload the correct payment slip or contact our support team for assistance.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="#" class="action-button">Review My Order</a>
                </div>
                
                <p>Best regards,<br/><strong>Buddhist Art MFU Team</strong></p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Buddhist Art MFU. All rights reserved.</p>
                <p>Mae Fah Luang University, Chiang Rai, Thailand</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
