const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER, // อีเมลผู้ส่ง
        pass: process.env.SMTP_PASS, // รหัสผ่าน (หรือ App Password)
    },
});

/**
 * Send an email with optional file attachments.
 *
 * @param {string}   to          - Recipient email address
 * @param {string}   subject     - Email subject
 * @param {string}   text        - Plain-text body (can be empty string)
 * @param {string}   html        - HTML body
 * @param {Array}    attachments - Optional nodemailer attachments array
 *   e.g. [{ filename: 'reservation.pdf', content: <Buffer>, contentType: 'application/pdf' }]
 */
exports.sendMail = async function (to, subject, text, html, attachments = []) {
    let mailOptions = {
        from: `"Buddhist Art MFU" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
        ...(attachments.length > 0 && { attachments }),
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Mail sent: %s", info.messageId);
        return {success: true, messageId: info.messageId};
    } catch (error) {
        console.error("Error sending mail:", error);
        return {success: false, error};
    }
}


