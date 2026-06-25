// middlewares/corsAndIP.js
const cors = require('cors');

// กำหนดโดเมนและ IP ที่อนุญาต
// CLIENT_URL (set on Render) can hold one or more comma-separated production
// origins, e.g. "https://buddhist-art-mfu.vercel.app".
const envOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const allowedDomains = ['https://example.com', 'https://anotherdomain.com', ...envOrigins];
const allowedIPs = ['192.168.1.1', '203.0.113.5','127.0.0.1'];

// การตั้งค่า CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        // or check if origin is in allowedDomains, is localhost, or any Vercel deployment
        const isLocalhost = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));
        const isVercel = origin && origin.endsWith('.vercel.app');
        if (!origin || allowedDomains.indexOf(origin) !== -1 || isLocalhost || isVercel) {
            callback(null, true);
        } else {
            console.warn("CORS blocked origin:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: "X-Requested-With, Content-Type, Accept, Authorization, X-Access-Token, lang, Origin",
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// ฟังก์ชัน middleware สำหรับการตรวจสอบ IP ที่อนุญาต
const ipCheckMiddleware = (req, res, next) => {

    const userIP = req.ip.replace('::ffff:', '') || req.connection.remoteAddress;
    if (allowedIPs.includes(userIP)) {
        next();
    } else {
        res.status(403).send('Access Denied');
    }
};

module.exports = { corsOptions, ipCheckMiddleware };
