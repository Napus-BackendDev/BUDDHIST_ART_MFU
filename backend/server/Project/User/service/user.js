const mongo = require('mongodb');
const User = require('../controller/user');
const UserModel = require('../models/user.model');
const ResMessage = require("../../Settings/service/message");
const { hashPassword, verifyPassword, isPasswordHash } = require('./password');

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

            // Safely convert Mongoose document to a plain JavaScript object
            const userData = withoutPassword(user);
            // Never expose the stored password in the sign-in response
            delete userData.password;
            
            // Overwrite role with the English string name for frontend routing logic
            userData.role = roleName;
            
            // Generate real JWT using global config
            userData.token = jwt.sign(
                { userId: user._id, role: roleName },
                cfg.jwtSecret,
                { expiresIn: cfg.tokenExpired / 1000 } // Convert ms to seconds
            );
            
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

exports.onCreate = async function (request, response) {
    try {
        const input = Array.isArray(request.body) ? request.body : [request.body];
        const data = await Promise.all(input.map(async item => ({
            ...item,
            ...(item.password ? { password: await hashPassword(item.password) } : {})
        })));
        const doc = await User.onCreate(Array.isArray(request.body) ? data : data[0]);
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
