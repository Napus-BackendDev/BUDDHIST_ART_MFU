const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cfg = require('../config/config');
const {
    isAdminRoleName,
    normalizePermissions,
    extractEnglishRoleTitle
} = require('../helpers/rolePermissions');

const escapeRegex = (str) => String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function resolveSessionContext(decoded) {
    if (isAdminRoleName(decoded && decoded.role)) {
        return {
            ...decoded,
            permissions: normalizePermissions(null, 'admin')
        };
    }

    let roleDoc = null;
    let roleName = String(decoded && decoded.role || '').trim();

    if (mongoose.connection && mongoose.connection.readyState === 1) {
        try {
            if (decoded && mongoose.isValidObjectId(decoded.userId)) {
                const User = require('../server/Project/User/models/user.model');
                const user = await User.findById(decoded.userId).select('role').populate('role').lean();
                if (user && user.role) {
                    roleDoc = user.role;
                    roleName = extractEnglishRoleTitle(user.role) || roleName;
                }
            }
            if (!roleDoc && roleName) {
                const Role = require('../server/Project/Settings/models/role.model');
                roleDoc = await Role.findOne({
                    'title.value': new RegExp(`^${escapeRegex(roleName)}$`, 'i')
                }).lean();
                if (roleDoc) {
                    roleName = extractEnglishRoleTitle(roleDoc) || roleName;
                }
            }
        } catch (lookupErr) {
            // Keep token role fallback if lookup fails unexpectedly.
        }
    }

    return {
        ...decoded,
        role: roleName || (decoded && decoded.role),
        permissions: normalizePermissions(roleDoc && roleDoc.permissions, roleName)
    };
}

const authMiddleware = async (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: "Authentication required. Please provide a valid token.",
            code: "40101"
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, cfg.jwtSecret);
    } catch (err) {
        return res.status(401).json({
            message: "Session expired or invalid token. Please log in again.",
            code: "40102"
        });
    }

    try {
        req.user = await resolveSessionContext(decoded);
        return next();
    } catch (err) {
        return next(err);
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
