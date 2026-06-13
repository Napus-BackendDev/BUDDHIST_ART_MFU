const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER, // อีเมลผู้ส่ง
        pass: process.env.SMTP_PASS, // รหัสผ่าน (หรือ App Password)
    },
});

exports.sendMail = async function (to, subject, text, html, attachments = []) {
    console.log(`[TEST MODE] Mail send request bypassed (to: ${to}, subject: ${subject})`);
    return { success: true, messageId: "test-bypassed-id" };
}


