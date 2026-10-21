const isAdmin = req => String(req.user && req.user.role || '').trim().toLowerCase() === 'admin';
const isSelf = (req, id) => Boolean(req.user && req.user.userId && id)
    && String(req.user.userId) === String(id);
const forbidden = res => res.status(403).json({ code: '40300', message: 'Access to this account is not allowed.' });

// Identity and privileges are managed by administrators, never profile forms.
const ownProfile = (req, res, next) => {
    if (isAdmin(req)) return next();
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

module.exports = { isAdmin, isSelf, forbidden, ownProfile };
