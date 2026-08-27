const mongo = require('mongodb');
const User = require('../controller/user');
const UserModel = require('../models/user.model');
const RoleModel = require('../../Settings/models/role.model');
const StatusModel = require('../../Settings/models/status.model');
const ResMessage = require("../../Settings/service/message");
const { hashPassword, verifyPassword, isPasswordHash } = require('./password');
const {
    normalizeStudentId,
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

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        const idOrSlug = request.body._id || request.body.id || request.query.id;
        
        if (mongo.ObjectId.isValid(idOrSlug)) {
            query._id = new mongo.ObjectId(idOrSlug);
            const doc = await User.onQuery(query);
            return ResMessage.sendResponse(response, 0, 20000, doc);
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
                return ResMessage.sendResponse(response, 0, 20000, matchedUser);
            }
            return ResMessage.sendResponse(response, 0, 40400);
        }
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        const doc = await User.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

const cfg = require('../../../../config/config');
const jwt = require('jsonwebtoken');

const createSessionUser = (user, roleName) => {
    const userData = withoutPassword(user);
    delete userData.password;
    userData.role = roleName;
    userData.token = jwt.sign(
        { userId: user._id, role: roleName },
        cfg.jwtSecret,
        { expiresIn: cfg.tokenExpired / 1000 }
    );
    return userData;
};

exports.onSignIn = async function (request, response) {
    try {
        const { username, password } = request.body;
        // Reject non-string credentials to block NoSQL operator injection (e.g. {$ne:null})
        if (typeof username !== 'string' || typeof password !== 'string') {
            return response.status(401).json({ message: "Invalid username or password" });
        }
        const user = await UserModel.findOne({ studentId: username })
            .select('+password')
            .populate('role')
            .lean();
        const passwordMatches = user && await verifyPassword(password, user.password);

        if (passwordMatches) {
            if (!isPasswordHash(user.password)) {
                await UserModel.updateOne(
                    { _id: user._id },
                    { $set: { password: await hashPassword(password) } }
                );
            }
            
            // Extract role name (in English) for frontend redirection
            let roleName = 'Customer';
            if (user.role && user.role.title) {
                const roleObj = user.role.title.find(t => t.key === 'en');
                if (roleObj) roleName = roleObj.value;
            } else if (user.role && typeof user.role === 'string') {
                roleName = user.role;
            }

            const userData = createSessionUser(user, roleName);
            
            return ResMessage.sendResponse(response, 0, 20000, userData);
        } else {
            // Send 401 status for invalid login
            return response.status(401).json({ message: "Invalid username or password" });
        }
    } catch (err) {
        console.error("Login Error:", err);
        return response.status(500).json({ message: "Server error during login" });
    }
};

exports.onDevAdminSignIn = async function (request, response) {
    const remoteAddress = String(request.socket && request.socket.remoteAddress || '');
    const isLoopback = remoteAddress === '::1'
        || remoteAddress === '127.0.0.1'
        || remoteAddress === '::ffff:127.0.0.1';
    const enabled = process.env.NODE_ENV === 'development'
        && process.env.ALLOW_DEV_ADMIN_LOGIN === 'true'
        && isLoopback;

    if (!enabled) {
        return response.status(404).json({ message: 'Not found' });
    }

    try {
        const adminRole = await RoleModel.findOne({
            title: { $elemMatch: { key: 'en', value: /^admin$/i } }
        }).lean();
        if (!adminRole) {
            return response.status(503).json({ message: 'Local Admin role is not configured' });
        }

        const user = await UserModel.findOne({ role: adminRole._id }).lean();
        if (!user) {
            return response.status(503).json({ message: 'Local Admin user is not configured' });
        }

        return ResMessage.sendResponse(response, 0, 20000, createSessionUser(user, 'Admin'));
    } catch (err) {
        console.error('Local Admin Login Error:', err);
        return response.status(500).json({ message: 'Server error during local Admin login' });
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
        const data = await Promise.all(input.map(async item => ({
            ...item,
            studentId: normalizeStudentId(item && item.studentId),
            ...(item.password ? { password: await hashPassword(item.password) } : {})
        })));

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
                        status: newStudentStatus ? newStudentStatus._id : item.status
                    };
                    if (artistImport) {
                        update.contact = normalizeArtistContact(studentId, item.contact, existing.contact);
                    }
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
                    if (newStudentStatus) createData.status = newStudentStatus._id;
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
        if (data.password) data.password = await hashPassword(data.password);
        data.studentId = normalizeStudentId(data.studentId);
        const existing = await UserModel.findById(query._id).populate('role').lean();
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
