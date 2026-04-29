// middlewares/corsAndIP.js
const cors = require('cors');

// กำหนดโดเมนและ IP ที่อนุญาต
const allowedDomains = ['https://example.com', 'https://anotherdomain.com'];
const allowedIPs = ['192.168.1.1', '203.0.113.5','127.0.0.1'];

// การตั้งค่า CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        // or check if origin is in allowedDomains or is a localhost/127.0.0.1
        const isLocalhost = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));
        if (!origin || allowedDomains.indexOf(origin) !== -1 || isLocalhost) {
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
