const { hasAdminAccess, hasTabPermission } = require('../helpers/rolePermissions');

const canReadTab = (req, tab) => hasTabPermission(req, tab, 'view');
const canEditTab = (req, tab) => hasTabPermission(req, tab, 'edit');
const isAdmin = req => canEditTab(req, 'users');
const isSelf = (req, id) => Boolean(req.user && req.user.userId && id)
    && String(req.user.userId) === String(id);
const forbidden = res => res.status(403).json({ code: '40300', message: 'Access to this account is not allowed.' });

// Identity and privileges are managed by administrators, never profile forms.
const ownProfile = (req, res, next) => {
    if (canEditTab(req, 'users')) return next();
    if (!isSelf(req, req.body._id)) return forbidden(res);
    const body = { _id: req.body._id };
    for (const field of ['name', 'bio', 'image', 'address']) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) body[field] = req.body[field];
    }
    if (req.body.contact && typeof req.body.contact === 'object') {
        body.contact = {};
        for (const field of ['personalEmail', 'telephone']) {
            if (Object.prototype.hasOwnProperty.call(req.body.contact, field)) body.contact[field] = req.body.contact[field];
        }
    }
    req.body = body;
    return next();
};

module.exports = {
    isAdmin,
    isSelf,
    forbidden,
    ownProfile,
    canReadTab,
    canEditTab,
    hasTabPermission,
    hasAdminAccess
};
