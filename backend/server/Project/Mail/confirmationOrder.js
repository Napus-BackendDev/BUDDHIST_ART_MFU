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
                background: linear-gradient(135deg, #2c3e50 0%, #000000 100%);
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
                <h1>Thank You!</h1>
                <p>We've Received Your Order</p>
            </div>
            <div class="content">
                <p>Dear <strong>${buyerName}</strong>,</p>
                <p>Your order has been successfully placed. We are currently processing your acquisition of the following artwork.</p>
                
                <table class="order-details">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>${artworkTitle}</strong><br>
                                <span style="font-size: 12px; color: #777777;">Order ID: ${orderId}</span>
                            </td>
                            <td style="text-align: right;">฿${price.toLocaleString()}</td>
                        </tr>
                        <tr class="total-row">
                            <td style="text-align: right;">Total:</td>
                            <td style="text-align: right; color: #2c3e50;">฿${price.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="text-align: center; margin: 30px 0;">
                    <span class="status-badge">Order Confirmed - ${orderDate}</span>
                </div>

                <p>Our team will contact you shortly regarding the shipping arrangements and authentication certificate. If you have any questions, please reply to this email.</p>
                
                <p>Best regards,<br/><strong>Buddhist Art MFU</strong></p>
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