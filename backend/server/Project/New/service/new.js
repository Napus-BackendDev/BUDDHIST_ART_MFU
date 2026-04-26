const mongo = require('mongodb');
const New = require('../controller/new');
const ResMessage = require("../../Settings/service/message");

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const doc = await New.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.log(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        const doc = await New.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.log(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async function (request, response) {
    try {
        console.log("Create Request Body:", JSON.stringify(request.body, null, 2));
        const doc = await New.onCreate(request.body);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.log(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpload = async function (request, response) {
    try {
        console.log("Upload Request Body:", request.body);
        console.log("Upload Request Files:", request.files ? request.files.length : "none");

        let query = {};
        if (!request.body._id) {
             console.error("Missing _id in upload request");
             return ResMessage.sendResponse(response, 0, 40400, "Missing news ID");
        }
        
        query._id = new mongo.ObjectId(request.body._id);
        
        let imagePaths = [];
        // Handle multiple files from .array()
        if (request.files && request.files.length > 0) {
            imagePaths = request.files.map(file => `${request.protocol}://${request.get('host')}/data/uploads/news/${file.filename}`);
        } 
        // Fallback for single file if somehow called that way
        else if (request.file) {
            imagePaths = [`${request.protocol}://${request.get('host')}/data/uploads/news/${request.file.filename}`];
        }

        if (imagePaths.length === 0) {
            console.error("No files found in request.files or request.file");
            return ResMessage.sendResponse(response, 0, 40400, "No files uploaded");
        }

        console.log("Updating images for ID:", request.body._id, "Paths:", imagePaths);
        const doc = await New.onUpdate(query, { $push: { images: { $each: imagePaths } } }, [], "images");
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error("Upload Error Details:", err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpdate = async function (request, response) {
    try {
        let query = {}
        query._id = new mongo.ObjectId(request.body._id);

        const doc = await New.onUpdate(query, request.body);
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
        const doc = await New.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpdateView = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.params.id);
        const doc = await New.onUpdate(query, { $inc: { views: 1 } });
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
