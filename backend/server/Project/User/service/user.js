const mongo = require('mongodb');
const User = require('../controller/user');
const UserModel = require('../models/user.model');
const RoleModel = require('../../Settings/models/role.model');
const StatusModel = require('../../Settings/models/status.model');
const { isAdmin, isSelf } = require('../../../../middleware/userAccessMiddleware');
const ResMessage = require("../../Settings/service/message");
const {
    normalizeStudentId,
    normalizeCourse,
    isArtistRole,
    normalizeArtistContact
} = require('./officialEmail');

const defaultPopulate = [
    { path: 'role' },
    { path: 'status' }
];

const withoutPassword = (doc) => {
    if (!doc) return doc;
    const value = doc.toObject ? doc.toObject() : JSON.parse(JSON.stringify(doc));
    delete value.password;
    return value;
};

const visibleProfile = (request, doc) => {
    if (!doc || isAdmin(request) || isSelf(request, doc._id)) return withoutPassword(doc);
    const value = withoutPassword(doc);
    return Object.fromEntries(['_id', 'name', 'image', 'bio', 'createdAt']
        .filter(key => value[key] !== undefined).map(key => [key, value[key]]));
};

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        const idOrSlug = request.body._id || request.body.id || request.query.id;
        
        if (mongo.ObjectId.isValid(idOrSlug)) {
            query._id = new mongo.ObjectId(idOrSlug);
            const doc = await User.onQuery(query);
            return ResMessage.sendResponse(response, 0, 20000, visibleProfile(request, doc));
        } else {
            // It's a slug, let's find all users and find the matching one (slugified)
            const allUsers = await User.onQuerys({});
            const matchedUser = allUsers.find(u => {
                if (u.name && Array.isArray(u.name)) {
                    const nameEn = u.name.find(n => n.key === 'en')?.value || '';
                    if (nameEn && nameEn.replace(/\s+/g, '-').toLowerCase() === idOrSlug.toLowerCase()) return true;
                    
                    const nameTh = u.name.find(n => n.key === 'th')?.value || '';
                    if (nameTh && nameTh.replace(/\s+/g, '-') === idOrSlug) return true;
                }
                return false;
            });
            if (matchedUser) {
                return ResMessage.sendResponse(response, 0, 20000, visibleProfile(request, matchedUser));
            }
            return ResMessage.sendResponse(response, 0, 40400);
        }
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        if (!isAdmin(request) && !mongo.ObjectId.isValid(request.user && request.user.userId)) {
            return response.status(403).json({ code: '40300', message: 'Account identity required.' });
        }
        let query = isAdmin(request) ? {} : { _id: new mongo.ObjectId(request.user.userId) };
        const doc = await User.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async function (request, response) {
    try {
        const isBulkImport = Array.isArray(request.body);
        const input = isBulkImport ? request.body : [request.body];
        const roleIds = input
            .map(item => item && item.role)
            .filter(role => role && mongo.ObjectId.isValid(role))
            .map(role => String(role));
        const roles = roleIds.length
            ? await RoleModel.find({ _id: { $in: [...new Set(roleIds)] } }).lean()
            : [];
        const roleNameById = new Map(roles.map(role => {
            const title = role.title && Array.isArray(role.title)
                ? (role.title.find(item => item.key === 'en') || role.title[0])
                : null;
            return [String(role._id), title && title.value ? String(title.value).trim().toLowerCase() : ''];
        }));
        const data = input.map(item => {
            const value = { ...item, studentId: normalizeStudentId(item && item.studentId) };
            if (value.course !== undefined) value.course = normalizeCourse(value.course);
            delete value.password;
            return value;
        });

        // Bulk user imports are intentionally idempotent. A repeated import should
        // not fail on unique studentId/email indexes or create duplicate accounts.
        // Existing accounts keep their password; their learner status is refreshed
        // to NewStudent for the imported cohort.
        let doc;
        if (!isBulkImport) {
            const item = data[0];
            if (isArtistRole(item.role, roleNameById)) {
                item.contact = normalizeArtistContact(item.studentId, item.contact);
            }
            doc = await User.onCreate(item);
        } else {
            const newStudentStatus = await StatusModel.findOne({
                $or: [
                    { code: 'NEW_STUDENT' },
                    { 'title.value': { $in: ['NewStudent', 'ผู้เรียนใหม่'] } }
                ]
            }).select('_id').lean();
            const imported = [];

            for (const item of data) {
                const studentId = normalizeStudentId(item.studentId);
                const studentEmail = String(item.contact && item.contact.studentEmail || '').trim();
                const matchers = [];
                if (studentId) matchers.push({ studentId });
                if (studentEmail) matchers.push({ 'contact.studentEmail': studentEmail });

                const existing = matchers.length
                    ? await UserModel.findOne({ $or: matchers }).populate('role')
                    : null;

                if (existing) {
                    // Existing accounts keep their role on repeat import. Apply
                    // Artist contact rules only when that stored role is Artist;
                    // this prevents a default Artist row from changing Admin or
                    // Customer contact data by accident.
                    const artistImport = existing.role
                        ? isArtistRole(existing.role, roleNameById)
                        : isArtistRole(item.role, roleNameById);
                    const update = {
                        name: item.name,
                        contact: {
                            ...(existing.contact && typeof existing.contact.toObject === 'function'
                                ? existing.contact.toObject()
                                : (existing.contact || {})),
                            ...(item.contact || {})
                        },
                        status: item.status || (newStudentStatus && newStudentStatus._id)
                    };
                    if (artistImport) {
                        update.contact = normalizeArtistContact(studentId, item.contact, existing.contact);
                    }
                    if (item.image) update.image = item.image;
                    if (item.course) update.course = item.course;
                    // Do not overwrite a user's existing password or role on repeat import.
                    if (!existing.role && item.role) update.role = item.role;
                    const updated = await UserModel.findByIdAndUpdate(
                        existing._id,
                        { $set: update },
                        { new: true }
                    );
                    imported.push(updated);
                } else {
                    const createData = { ...item };
                    if (isArtistRole(item.role, roleNameById)) {
                        createData.contact = normalizeArtistContact(studentId, item.contact);
                    }
                    if (!createData.status && newStudentStatus) createData.status = newStudentStatus._id;
                    imported.push(await UserModel.create(createData));
                }
            }
            doc = await UserModel.populate(imported, defaultPopulate);
        }
        const safeDoc = Array.isArray(doc) ? doc.map(withoutPassword) : withoutPassword(doc);
        return ResMessage.sendResponse(response, 0, 20000, safeDoc);
    } catch (err) {
        console.log(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpload = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const imagePath = User.getImageUrl(request, request.file.destination, request.file.filename);

        const doc = await User.onUpdate(query, { image: imagePath }, [], "image");
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.log(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpdate = async function (request, response) {
    try {
        let query = {}
        query._id = new mongo.ObjectId(request.body._id);

        const data = { ...request.body };
        delete data._id;
        if (data.contact && Object.prototype.hasOwnProperty.call(data.contact, 'personalEmail')) {
            const email = data.contact.personalEmail === null ? '' : data.contact.personalEmail;
            if (typeof email !== 'string' || email.trim().length > 254 || (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
                return response.status(400).json({ code: '40000', message: 'Invalid personal email address.' });
            }
            data.contact = { ...data.contact, personalEmail: email.trim() };
        }
        if (data.contact && Object.prototype.hasOwnProperty.call(data.contact, 'telephone')) {
            const phone = data.contact.telephone === null ? '' : data.contact.telephone;
            if (typeof phone !== 'string' || (phone.trim() && (!/^\+?[\d\s()-]+$/.test(phone.trim()) || !/^\d{9,15}$/.test(phone.replace(/\D/g, ''))))) {
                return response.status(400).json({ code: '40000', message: 'Invalid telephone number.' });
            }
            data.contact = { ...data.contact, telephone: phone.trim() };
        }
        delete data.password;
        if (!isAdmin(request)) delete data.course;
        else if (data.course !== undefined) data.course = normalizeCourse(data.course);
        if (data.studentId !== undefined) data.studentId = normalizeStudentId(data.studentId);
        const existing = await UserModel.findById(query._id).populate('role').lean();
        if (data.contact && existing) data.contact = { ...existing.contact, ...data.contact };
        const roles = data.role && mongo.ObjectId.isValid(data.role)
            ? await RoleModel.find({ _id: data.role }).lean()
            : [];
        const roleNameById = new Map(roles.map(role => {
            const title = role.title && Array.isArray(role.title)
                ? (role.title.find(item => item.key === 'en') || role.title[0])
                : null;
            return [String(role._id), title && title.value ? String(title.value).trim().toLowerCase() : ''];
        }));
        // If a role is supplied, use the effective (new) role. When omitted,
        // preserve the stored role. This keeps the automatic email policy scoped
        // to Artist accounts even when an Artist is changed to another role.
        const hasIncomingRole = data.role !== undefined && data.role !== null && data.role !== '';
        const effectiveRole = hasIncomingRole ? data.role : (existing && existing.role);
        if (isArtistRole(effectiveRole, roleNameById)) {
            data.contact = normalizeArtistContact(data.studentId || (existing && existing.studentId), data.contact, existing && existing.contact);
        }
        const doc = await User.onUpdate(query, data);
        return ResMessage.sendResponse(response, 0, 20000, withoutPassword(doc));
    } catch (err) {
        console.error(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onDelete = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const doc = await User.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
