const mongoose = require('mongoose');
const Artwork = require('../server/Project/Artwork/models/artwork.model');
const User = require('../server/Project/User/models/user.model');
const Status = require('../server/Project/Settings/models/status.model');
const { STATUS_CODES, hasCode, queryForCode } = require('../server/Project/Settings/statusCodes');
const { canReadTab, canEditTab } = require('./userAccessMiddleware');
const canReadArtworks = req => canReadTab(req, 'artworks')
    || canReadTab(req, 'submissions')
    || canReadTab(req, 'overview')
    || canReadTab(req, 'analytics');
const canEditArtworks = req => canEditTab(req, 'artworks');
const idOf = value => value && String(value._id || value);
const isArtist = req => String(req.user?.role || '').trim().toLowerCase() === 'artist'
    && mongoose.isValidObjectId(req.user?.userId);
const isOwner = (req, doc) => isArtist(req) && idOf(doc.artist) === String(req.user.userId);
const fail = (status, message) => Object.assign(new Error(message), { status });
const respond = (res, error, next) => error.status
    ? res.status(error.status).json({ code: String(error.status) + '00', message: error.message }) : next(error);

const readQuery = async req => {
    if (canReadArtworks(req)) return {};
    const statuses = await Status.find({ $or: [queryForCode(STATUS_CODES.APPROVED), queryForCode(STATUS_CODES.RESERVED)] }).select('_id').lean();
    const published = { 'status.approval': { $in: statuses.map(status => status._id) } };
    return isArtist(req) ? { $or: [published, { artist: req.user.userId }] } : published;
};

const visible = (req, doc) => {
    if (!doc || canReadArtworks(req) || isOwner(req, doc)) return doc;
    const value = { ...doc };
    delete value.remark;
    delete value.rejectionReason;
    if (value.artist && typeof value.artist === 'object') {
        value.artist = Object.fromEntries(['_id', 'name', 'image', 'bio'].filter(key => value.artist[key] !== undefined).map(key => [key, value.artist[key]]));
    }
    if (value.postTermSale) {
        value.postTermSale = { ...value.postTermSale };
        for (const key of ['note', 'history', 'reviewReason', 'recordedBy', 'contactMethod']) delete value.postTermSale[key];
    }
    return value;
};

async function owned(req, id) {
    if (!isArtist(req)) throw fail(403, 'Artist access required.');
    if (!mongoose.isValidObjectId(id)) throw fail(400, 'A valid artwork ID is required.');
    const doc = await Artwork.findById(id).populate('status.approval status.sale').lean();
    if (!doc) throw fail(404, 'Artwork not found.');
    if (!isOwner(req, doc)) throw fail(403, 'Access to this artwork is not allowed.');
    if (hasCode(doc.status?.approval, STATUS_CODES.RESERVED) || hasCode(doc.status?.sale, STATUS_CODES.SOLD_OUT)) {
        throw fail(403, 'Reserved or sold artworks cannot be changed by the artist.');
    }
    return doc;
}

const editable = new Set(['_id', 'title', 'description', 'artist', 'technique', 'size', 'price', 'category', 'status', 'remark', 'image', 'storage', 'storageDetail']);
async function prepare(req, current = null) {
    if (!isArtist(req)) throw fail(403, 'Artist access required.');
    const body = req.body;
    if (Array.isArray(body) || Object.keys(body).some(key => !editable.has(key))) throw fail(403, 'Artwork identity and workflow fields are managed by the server.');
    if (body.artist && idOf(body.artist) !== String(req.user.userId)) throw fail(403, 'An artwork must belong to its submitting artist.');
    const incoming = body.status || {};
    const pending = await Status.findOne(queryForCode(STATUS_CODES.PENDING)).lean();
    if (incoming.approval && idOf(incoming.approval) !== idOf(pending)) throw fail(403, 'Only administrators can approve artworks.');
    let sale = current?.status?.sale;
    if (incoming.sale) {
        const selected = mongoose.isValidObjectId(idOf(incoming.sale)) ? await Status.findById(idOf(incoming.sale)).lean() : null;
        if (!hasCode(selected, STATUS_CODES.AVAILABLE) && !hasCode(selected, STATUS_CODES.EXHIBITION)) throw fail(403, 'Invalid artist sale status.');
        sale = current?.postTermSale?.applicable ? current.status.sale : selected;
    }
    if (!sale) sale = await Status.findOne(queryForCode(STATUS_CODES.AVAILABLE)).lean();
    const metadataChanged = Object.keys(body).some(key => !['_id', 'artist', 'status'].includes(key));
    const approval = !current || metadataChanged || incoming.approval ? pending : current.status?.approval;
    if (!approval || !sale) throw fail(503, 'Artwork review and sale statuses must be configured.');
    req.body = { ...body, artist: req.user.userId, status: { approval: idOf(approval), sale: idOf(sale) } };
}

const create = async (req, res, next) => {
    if (canEditArtworks(req)) {
        try {
            const rows = Array.isArray(req.body) ? req.body : [req.body];
            for (let index = 0; index < rows.length; index++) {
                const artist = idOf(rows[index]?.artist);
                if (!mongoose.isValidObjectId(artist) || !await User.exists({ _id: artist })) {
                    throw fail(400, `Row ${index + 1}: an existing artwork artist is required.`);
                }
            }
            return next();
        } catch (error) { return respond(res, error, next); }
    }
    try { await prepare(req); return next(); } catch (error) { return respond(res, error, next); }
};
const update = async (req, res, next) => {
    if (canEditArtworks(req)) return next();
    try {
        const doc = await owned(req, req.body._id);
        await prepare(req, doc);
        req.artworkWriteQuery = { artist: req.user.userId, 'status.approval': doc.status?.approval?._id, 'status.sale': doc.status?.sale?._id };
        return next();
    } catch (error) { return respond(res, error, next); }
};
const remove = async (req, res, next) => {
    if (canEditArtworks(req)) return next();
    try {
        const doc = await owned(req, req.body._id);
        if (doc.postTermSale?.applicable) throw fail(403, 'Submission artwork records must be managed by administrators.');
        req.artworkWriteQuery = { artist: req.user.userId, 'status.approval': doc.status?.approval?._id, 'status.sale': doc.status?.sale?._id };
        return next();
    } catch (error) { return respond(res, error, next); }
};
const authorizeUpload = async req => {
    if (canEditArtworks(req)) return;
    const doc = await owned(req, req.body._id);
    if (!hasCode(doc.status?.approval, STATUS_CODES.PENDING)) {
        throw fail(403, 'Save the artwork for review before uploading a replacement image.');
    }
    req.artworkWriteQuery = { artist: req.user.userId, 'status.approval': doc.status.approval._id };
};

module.exports = { readQuery, visible, create, update, remove, authorizeUpload };
