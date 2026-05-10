const mongo = require('mongodb');
const User = require('../controller/user');
const ResMessage = require("../../Settings/service/message");

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const doc = await User.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
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
        // In this system, studentId is often used as the username
        let query = { studentId: username, password: password };
        const users = await User.onQuerys(query);
        
        if (users && users.length > 0) {
            const user = users[0];
            
            // Extract role name (in English) for frontend redirection
            let roleName = 'Customer';
            if (user.role && user.role.title) {
                const roleObj = user.role.title.find(t => t.key === 'en');
                if (roleObj) roleName = roleObj.value;
            } else if (user.role && typeof user.role === 'string') {
                roleName = user.role;
            }

            // Safely convert Mongoose document to a plain JavaScript object
            const userData = JSON.parse(JSON.stringify(user));
            
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

        const doc = await User.onCreate(request.body);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.log(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpload = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const imagePath = `${request.protocol}://${request.get('host')}/uploads/profile/${request.file.filename}`;

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

        const doc = await User.onUpdate(query, request.body);
        return ResMessage.sendResponse(response, 0, 20000, doc);
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
