const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // อีเมลผู้ส่ง
        pass: process.env.EMAIL_PASS, // รหัสผ่าน (หรือ App Password)
    },
});

exports.sendMail = async function (to, subject, text, html) {
    let mailOptions = {
        from: `"My App" <${process.env.EMAIL_USER}>`,
        to,          // ผู้รับ
        subject,     // หัวข้อ
        text,        // ข้อความธรรมดา
        html,        // ข้อความแบบ HTML
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


