const auth = require('./authMiddleware');

/**
 * Protect administrative mutations. JWTs currently carry the English role name,
 * so comparison stays case-insensitive for backwards compatibility.
 */
module.exports = function adminMiddleware(req, res, next) {
    return auth(req, res, () => {
        const role = String(req.user && req.user.role || '').trim().toLowerCase();
        if (role !== 'admin') {
            return res.status(403).json({
                code: '40300',
                message: 'Administrator access required.'
            });
        }
        return next();
    });
};
