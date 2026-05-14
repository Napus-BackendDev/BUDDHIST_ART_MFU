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
                background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
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
            .certificate-badge {
                display: inline-block;
                padding: 10px 20px;
                background-color: #2c3e50;
                color: #ffffff;
                border-radius: 4px;
                text-decoration: none;
                font-weight: bold;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Payment Approved!</h1>
                <p>Your acquisition is now complete</p>
            </div>
            <div class="content">
                <p>Dear <strong>${buyerName}</strong>,</p>
                <p>Great news! Your payment for the order <strong>#${orderId}</strong> has been verified and approved.</p>
                
                <table class="order-details">
                    <tr>
                        <td><strong>Artwork:</strong></td>
                        <td style="text-align: right;">${artworkTitle}</td>
                    </tr>
                    <tr>
                        <td><strong>Total Amount:</strong></td>
                        <td style="text-align: right;">฿${price.toLocaleString()}</td>
                    </tr>
                </table>

                <p>We have attached the <strong>Certificate of Authenticity</strong> for your new artwork to this email. You can also download it anytime from your order history on our website.</p>
                
                <p>Our logistics team will coordinate the delivery and will contact you shortly with the tracking information.</p>
                
                <p>Thank you for supporting Buddhist Art MFU.</p>
                
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
