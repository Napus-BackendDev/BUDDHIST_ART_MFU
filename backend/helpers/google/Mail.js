const nodemailer = require("nodemailer");

const smtpPort = Number.parseInt(process.env.SMTP_PORT || "25", 10);
const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpSecure,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
        : undefined,
});

exports.sendMail = async function (to, subject, text, html, attachments = []) {
    if (process.env.EMAIL_ENABLED !== "true") {
        console.log(`[Email] Sending disabled; skipped message to ${to}.`);
        return { success: false, disabled: true };
    }
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to,
            subject,
            text,
            html,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Mail sent successfully to ${to}. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[Email] Failed to send email to ${to}:`, error);
        throw error;
    }
};
