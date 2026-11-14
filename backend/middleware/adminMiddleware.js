const auth = require('./authMiddleware');
const { hasTabPermission, isAdminRoleName } = require('../helpers/rolePermissions');

/**
 * Protect administrative mutations. JWTs currently carry the English role name,
 * so comparison stays case-insensitive for backwards compatibility.
 */
function adminMiddleware(req, res, next) {
    return auth(req, res, () => {
        if (!isAdminRoleName(req.user && req.user.role)) {
            return res.status(403).json({
                code: '40300',
                message: 'Administrator access required.'
            });
        }
        return next();
    });
}

adminMiddleware.requirePermission = function requirePermission(tab, requiredLevel = 'edit') {
    return (req, res, next) => auth(req, res, () => {
        if (!hasTabPermission(req, tab, requiredLevel)) {
            return res.status(403).json({
                code: '40300',
                message: requiredLevel === 'edit'
                    ? 'Insufficient permissions to modify this section.'
                    : 'Insufficient permissions to view this section.'
            });
        }
        return next();
    });
};

module.exports = adminMiddleware;
