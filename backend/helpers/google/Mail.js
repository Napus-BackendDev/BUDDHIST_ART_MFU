const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER, // อีเมลผู้ส่ง
        pass: process.env.SMTP_PASS, // รหัสผ่าน (หรือ App Password)
    },
});

exports.sendMail = async function (to, subject, text, html, attachments = []) {
    try {
        let mailOptions = {
            from: process.env.SMTP_USER,
            to: to,
            subject: subject,
            text: text,
            html: html,
            attachments: attachments
        };
        let info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Mail sent successfully to ${to}. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[Email] Failed to send email to ${to}:`, error);
        throw error;
    }
}


