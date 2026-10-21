const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { sendMail } = require('../../../helpers/google/Mail');

router.post('', rateLimit({ windowMs: 15 * 60 * 1000, limit: 3,
    standardHeaders: 'draft-7', legacyHeaders: false }), async (req, res) => {
    const inquiry = {};
    for (const [field, max] of Object.entries({ name: 150, email: 254, subject: 200, message: 5000 })) {
        if (typeof req.body?.[field] !== 'string') return res.status(400).json({ success: false });
        inquiry[field] = req.body[field].trim();
        if (!inquiry[field] || inquiry[field].length > max) return res.status(400).json({ success: false });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) return res.status(400).json({ success: false });
    const recipient = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
    if (!recipient || process.env.EMAIL_ENABLED !== 'true') return res.status(503).json({ success: false });
    try {
        // User input stays in plain text, never in recipient or mail headers.
        const result = await sendMail(recipient, 'Buddhist Art MFU: Contact inquiry',
            `Name: ${inquiry.name}\nEmail: ${inquiry.email}\nSubject: ${inquiry.subject}\n\n${inquiry.message}`);
        if (!result?.success) return res.status(503).json({ success: false });
        return res.json({ success: true });
    } catch (error) {
        return res.status(502).json({ success: false });
    }
});

module.exports = router;
