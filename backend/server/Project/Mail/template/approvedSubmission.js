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
                background: linear-gradient(135deg, #d4a017 0%, #8b6b10 100%);
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
                border-left: 4px solid #d4a017;
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
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #d4a017;
                color: #ffffff;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Congratulations!</h1>
                <p>Your Submission has been Approved</p>
            </div>
            <div class="content">
                <p>Dear <strong>${artistName}</strong>,</p>
                <p>We are pleased to inform you that your artwork submission has been reviewed and approved by our curators.</p>
                
                <div class="artwork-box">
                    <p style="margin: 0;"><strong>Submission Title:</strong> ${submissionTitle}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Approval Date:</strong> ${approvalDate}</p>
                </div>

                <p>Your work is now part of the Buddhist Art MFU collection. It will be showcased to our community and potential collectors shortly.</p>
                
                <p>Thank you for contributing your talent to our gallery.</p>
                
                <a href="#" class="button">View Your Profile</a>
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
