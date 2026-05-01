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
                background: linear-gradient(135deg, #607d8b 0%, #455a64 100%);
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
                border-left: 4px solid #607d8b;
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
                <h1>Update on Your Submission</h1>
                <p>Status: Not Approved</p>
            </div>
            <div class="content">
                <p>Dear <strong>${artistName}</strong>,</p>
                <p>Thank you for giving us the opportunity to review your artwork, <strong>"${submissionTitle}"</strong>.</p>
                
                <p>After careful consideration by our curatorial team, we regret to inform you that we are unable to accept your submission at this time.</p>
                
                ${reason ? `
                <div class="info-box">
                    <p style="margin: 0;"><strong>Feedback from Curators:</strong></p>
                    <p style="margin: 5px 0 0 0;">${reason}</p>
                </div>
                ` : ''}

                <p>This decision does not reflect on the quality of your talent, but rather on our current collection focus and gallery requirements. We encourage you to continue creating and consider submitting other works in the future.</p>
                
                <p>We appreciate your interest in Buddhist Art MFU.</p>
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
