const mongoose = require('mongoose');
const Group = require('../models/group.model');
const Status = require('../models/status.model');
const Verification = require('../models/verification.model');
const Message = require('../models/message.model');
const User = require('../../User/models/user.model');
const Artwork = require('../../Artwork/models/artwork.model');
const Order = require('../../Order/models/order.model');
const Submission = require('../../Submission/models/submission.model');
const Category = require('../../Artwork/models/category.model');
const { titleValue, sanitizeCreate, sanitizeUpdate } = require('../helpers');
const { LEGACY_NAMES } = require('../statusCodes');

const isId = value => mongoose.Types.ObjectId.isValid(value);
const oid = value => new mongoose.Types.ObjectId(value);

const CORE_CODES = new Set([
    'AVAILABLE', 'EXHIBITION', 'SOLD_OUT', 'PENDING', 'APPROVED',
    'REJECTED', 'RESERVED', 'NEW_STUDENT', 'OLD_STUDENT', 'CANCELLED'
]);
const CORE_LEGACY_NAMES = new Set([...CORE_CODES].flatMap(code => LEGACY_NAMES[code] || []));

const usage = async (resource, id) => {
    const value = oid(id);
    if (resource === 'group') {
        const [statuses, verifications] = await Promise.all([
            Status.countDocuments({ group: value }),
            Verification.countDocuments({ group: value })
        ]);
        return {
            totalReferences: statuses + verifications,
            references: [
                { collection: 'statuses', field: 'group', count: statuses },
                { collection: 'verifications', field: 'group', count: verifications }
            ].filter(item => item.count > 0),
            requiresReplacement: statuses + verifications > 0,
            protected: false
        };
    }
    if (resource === 'status') {
        const [users, artworksApproval, artworksSale, orders, submissions, verifications, messages] = await Promise.all([
            User.countDocuments({ status: value }),
            Artwork.countDocuments({ 'status.approval': value }),
            Artwork.countDocuments({ 'status.sale': value }),
            Order.countDocuments({ status: value }),
            Submission.countDocuments({ 'assignments.artworks.status': value }),
            Verification.countDocuments({ status: value }),
            Message.countDocuments({ status: value })
        ]);
        const references = [
            ['users', 'status', users],
            ['artworks', 'status.approval', artworksApproval],
            ['artworks', 'status.sale', artworksSale],
            ['orders', 'status', orders],
            ['submissions', 'assignments.artworks.status', submissions],
            ['verifications', 'status', verifications],
            ['messages', 'status', messages]
        ].filter(item => item[2] > 0).map(item => ({ collection: item[0], field: item[1], count: item[2] }));
        const status = await Status.findById(value).select('code title').lean();
        const legacyTitle = status && Array.isArray(status.title)
            ? status.title.find(item => item.key === 'en')?.value
            : '';
        return {
            totalReferences: references.reduce((sum, item) => sum + item.count, 0),
            references,
            requiresReplacement: references.length > 0,
            protected: Boolean(status && (CORE_CODES.has(status.code) || CORE_LEGACY_NAMES.has(legacyTitle)))
        };
    }
    if (resource === 'category') {
        const [artworks, submissions] = await Promise.all([
            Artwork.countDocuments({ category: value }),
            Submission.countDocuments({ 'assignments.artworks.category': value })
        ]);
        return {
            totalReferences: artworks + submissions,
            references: [
                { collection: 'artworks', field: 'category', count: artworks },
                { collection: 'submissions', field: 'assignments.artworks.category', count: submissions }
            ].filter(item => item.count > 0),
            requiresReplacement: artworks + submissions > 0,
            protected: false
        };
    }
    throw new Error('Unsupported resource');
};

const replaceWithoutTransaction = async (resource, id, replacementId) => {
    const from = oid(id);
    const to = replacementId ? oid(replacementId) : null;
    if (resource === 'group') {
        await Promise.all([
            Status.updateMany({ group: from }, { $set: { group: to } }),
            Verification.updateMany({ group: from }, { $set: { group: to } })
        ]);
        return Group.deleteOne({ _id: from });
    }
    if (resource === 'status') {
        await Promise.all([
            User.updateMany({ status: from }, { $set: { status: to } }),
            Artwork.updateMany({ 'status.approval': from }, { $set: { 'status.approval': to } }),
            Artwork.updateMany({ 'status.sale': from }, { $set: { 'status.sale': to } }),
            Order.updateMany({ status: from }, { $set: { status: to } }),
            Submission.updateMany({ 'assignments.artworks.status': from }, { $set: { 'assignments.$[].artworks.$[artwork].status': to } }, { arrayFilters: [{ 'artwork.status': from }] }),
            Verification.updateMany({ status: from }, { $set: { status: to } }),
            Message.updateMany({ status: from }, { $set: { status: to } })
        ]);
        return Status.deleteOne({ _id: from });
    }
    await Promise.all([
        Artwork.updateMany({ category: from }, { $set: { category: to } }),
        Submission.updateMany({ 'assignments.artworks.category': from }, { $set: { 'assignments.$[].artworks.$[artwork].category': to } }, { arrayFilters: [{ 'artwork.category': from }] })
    ]);
    return Category.deleteOne({ _id: from });
};

const replaceAndDelete = async (resource, id, replacementId) => {
    if (!isId(id)) throw Object.assign(new Error('Invalid id'), { statusCode: 400 });
    const impact = await usage(resource, id);
    if (impact.protected) throw Object.assign(new Error('Protected workflow status'), { statusCode: 409, impact });
    if (impact.requiresReplacement && !isId(replacementId)) {
        throw Object.assign(new Error('Replacement is required'), { statusCode: 409, impact });
    }
    if (impact.requiresReplacement && String(id) === String(replacementId)) {
        throw Object.assign(new Error('Replacement must be different'), { statusCode: 400, impact });
    }

    // Validate the replacement before choosing the standalone-Mongo fallback
    // so an invalid target can never leave references partially moved.
    if (replacementId) {
        const replacementModel = resource === 'group' ? Group : resource === 'status' ? Status : Category;
        if (!isId(replacementId) || !(await replacementModel.exists({ _id: replacementId }))) {
            throw Object.assign(new Error(`Replacement ${resource} not found`), { statusCode: 404, impact });
        }
    }

    const topologyType = mongoose.connection.client && mongoose.connection.client.topology && mongoose.connection.client.topology.description && mongoose.connection.client.topology.description.type;
    if (topologyType && !['ReplicaSetWithPrimary', 'Sharded'].includes(topologyType)) {
        return replaceWithoutTransaction(resource, id, replacementId);
    }

    const session = await mongoose.startSession();
    try {
        let result;
        const applyChanges = async activeSession => {
            const from = oid(id);
            const to = replacementId ? oid(replacementId) : null;
            const options = activeSession ? { session: activeSession } : {};
            if (resource === 'group') {
                if (to && !(await Group.exists({ _id: to }).session(activeSession))) throw Object.assign(new Error('Replacement group not found'), { statusCode: 404 });
                await Status.updateMany({ group: from }, { $set: { group: to } }, options);
                await Verification.updateMany({ group: from }, { $set: { group: to } }, options);
                result = await Group.deleteOne({ _id: from }, options);
            } else if (resource === 'status') {
                if (to && !(await Status.exists({ _id: to }).session(activeSession))) throw Object.assign(new Error('Replacement status not found'), { statusCode: 404 });
                await User.updateMany({ status: from }, { $set: { status: to } }, options);
                await Artwork.updateMany({ 'status.approval': from }, { $set: { 'status.approval': to } }, options);
                await Artwork.updateMany({ 'status.sale': from }, { $set: { 'status.sale': to } }, options);
                await Order.updateMany({ status: from }, { $set: { status: to } }, options);
                await Submission.updateMany({ 'assignments.artworks.status': from }, { $set: { 'assignments.$[].artworks.$[artwork].status': to } }, { ...options, arrayFilters: [{ 'artwork.status': from }] });
                await Verification.updateMany({ status: from }, { $set: { status: to } }, options);
                await Message.updateMany({ status: from }, { $set: { status: to } }, options);
                result = await Status.deleteOne({ _id: from }, options);
            } else if (resource === 'category') {
                if (to && !(await Category.exists({ _id: to }).session(activeSession))) throw Object.assign(new Error('Replacement category not found'), { statusCode: 404 });
                await Artwork.updateMany({ category: from }, { $set: { category: to } }, options);
                await Submission.updateMany({ 'assignments.artworks.category': from }, { $set: { 'assignments.$[].artworks.$[artwork].category': to } }, { ...options, arrayFilters: [{ 'artwork.category': from }] });
                result = await Category.deleteOne({ _id: from }, options);
            }
        };
        try {
            await session.withTransaction(() => applyChanges(session));
        } catch (error) {
            // Local development commonly uses standalone MongoDB. Keep the same
            // preflight checks and execute the already validated replacement as
            // a compatibility fallback when transactions are unavailable.
            const unsupportedTransaction = /does not support retryable writes|transaction numbers are only allowed|transactions are not supported|not a replica set|mongos/i.test(String(error && error.message));
            if (unsupportedTransaction) await applyChanges(null);
            else throw error;
        }
        return result;
    } finally {
        await session.endSession();
    }
};

const respondError = (response, error) => response.status(error.statusCode || 404).json({
    code: error.statusCode === 409 ? '40900' : '40400',
    message: error.message || 'Settings request failed.',
    impact: error.impact
});

exports.impact = async (req, res) => {
    try {
        if (!isId(req.params.id)) return res.status(400).json({ code: '40000', message: 'Invalid id.' });
        return res.status(200).json({ data: await usage(req.params.resource, req.params.id) });
    } catch (error) { return respondError(res, error); }
};

exports.delete = async (req, res) => {
    try {
        const resource = req.params.resource;
        const id = req.body && (req.body.id || req.body._id);
        return res.status(200).json({ data: await replaceAndDelete(resource, id, req.body && req.body.replacementId) });
    } catch (error) { return respondError(res, error); }
};

exports.groupCreate = async (req, res) => {
    try { return res.status(200).json({ data: await Group.create(sanitizeCreate(req.body, 'GROUP')) }); }
    catch (error) { return respondError(res, error); }
};
exports.groupUpdate = async (req, res) => {
    try { return res.status(200).json({ data: await Group.findByIdAndUpdate(req.body._id, sanitizeUpdate(req.body), { new: true }).lean() }); }
    catch (error) { return respondError(res, error); }
};
exports.statusCreate = async (req, res) => {
    try {
        const data = sanitizeCreate(req.body, 'STATUS');
        data.group = req.body.group;
        return res.status(200).json({ data: await Status.create(data) });
    } catch (error) { return respondError(res, error); }
};
exports.statusUpdate = async (req, res) => {
    try {
        const data = sanitizeUpdate(req.body);
        if (req.body.group) data.group = req.body.group;
        return res.status(200).json({ data: await Status.findByIdAndUpdate(req.body._id, data, { new: true }).populate('group').lean() });
    } catch (error) { return respondError(res, error); }
};
exports.categoryCreate = async (req, res) => {
    try {
        const data = sanitizeCreate(req.body, 'CATEGORY');
        return res.status(200).json({ data: await Category.create(data) });
    } catch (error) { return respondError(res, error); }
};
exports.categoryUpdate = async (req, res) => {
    try { return res.status(200).json({ data: await Category.findByIdAndUpdate(req.body._id, sanitizeUpdate(req.body), { new: true }).lean() }); }
    catch (error) { return respondError(res, error); }
};

exports.CORE_CODES = CORE_CODES;
