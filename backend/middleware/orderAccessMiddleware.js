const mongoose = require('mongoose');
const Order = require('../server/Project/Order/models/order.model');
const Status = require('../server/Project/Settings/models/status.model');
const { STATUS_CODES, hasCode } = require('../server/Project/Settings/statusCodes');
const { isAdmin } = require('./userAccessMiddleware');

const identity = req => req.user && req.user.userId;
const fail = (status, message) => Object.assign(new Error(message), { status });
const respond = (res, error, next) => error.status
    ? res.status(error.status).json({ code: String(error.status) + '00', message: error.message })
    : next(error);

async function findOwnedOrder(req, id) {
    if (!mongoose.isValidObjectId(id)) throw fail(400, 'A valid order ID is required.');
    const order = await Order.findById(id).populate('status').lean();
    if (!order) throw fail(404, 'Order not found.');
    if (!isAdmin(req) && (!identity(req) || String(order.user) !== String(identity(req)))) {
        throw fail(403, 'Access to this order is not allowed.');
    }
    return order;
}

const scopeList = (req, res, next) => {
    if (!isAdmin(req) && !mongoose.isValidObjectId(identity(req))) {
        return respond(res, fail(403, 'Account identity required.'), next);
    }
    req.orderQuery = isAdmin(req) ? {} : { user: identity(req) };
    return next();
};

const create = (req, res, next) => {
    if (isAdmin(req)) return next();
    if (!mongoose.isValidObjectId(identity(req)) || (req.body.user && String(req.body.user) !== String(identity(req)))) {
        return respond(res, fail(403, 'An order must belong to the signed-in buyer.'), next);
    }
    req.body = {
        user: identity(req), artwork: req.body.artwork,
        contact: req.body.contact, address: req.body.address
    };
    return next();
};

const read = async (req, res, next) => {
    try { await findOwnedOrder(req, req.params.id); return next(); }
    catch (error) { return respond(res, error, next); }
};

const update = async (req, res, next) => {
    if (isAdmin(req)) return next();
    try {
        const order = await findOwnedOrder(req, req.body._id);
        const allowed = new Set(['_id', 'contact', 'address', 'status']);
        if (Object.keys(req.body).some(key => !allowed.has(key)) || !hasCode(order.status, STATUS_CODES.RESERVED)) {
            throw fail(403, 'Only checkout details of an unpaid order can be changed.');
        }
        if (req.body.status !== undefined) {
            const status = mongoose.isValidObjectId(req.body.status) ? await Status.findById(req.body.status).lean() : null;
            if (!hasCode(status, STATUS_CODES.CANCELLED)) throw fail(403, 'Only administrators can approve or reject payments.');
        }
        // Do not let a concurrent approval be overwritten by a stale checkout.
        req.orderWriteQuery = { user: identity(req), status: order.status._id };
        return next();
    } catch (error) { return respond(res, error, next); }
};

const authorizeUpload = async req => {
    const order = await findOwnedOrder(req, req.body._id);
    if (!hasCode(order.status, STATUS_CODES.RESERVED) || order.image) {
        throw fail(409, 'Order is not awaiting a payment slip.');
    }
    const createdAt = new Date(order.createdAt).getTime();
    if (!Number.isFinite(createdAt) || createdAt <= Date.now() - 24 * 60 * 60 * 1000) {
        throw fail(409, 'The 24-hour payment deadline has expired.');
    }
};

module.exports = { scopeList, create, read, update, authorizeUpload };
