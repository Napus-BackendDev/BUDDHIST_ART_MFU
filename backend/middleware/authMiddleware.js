const jwt = require('jsonwebtoken');
const cfg = require('../config/config');

const authMiddleware = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: "Authentication required. Please provide a valid token.",
            code: "40101"
        });
    }

    try {
        const decoded = jwt.verify(token, cfg.jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Session expired or invalid token. Please log in again.",
            code: "40102"
        });
    }
};

// Public profile reads may include a valid session to retrieve one's own details.
authMiddleware.optional = (req, res, next) => {
    if (req.headers['x-access-token'] || req.headers.authorization) {
        return authMiddleware(req, res, next);
    }
    return next();
};

module.exports = authMiddleware;
