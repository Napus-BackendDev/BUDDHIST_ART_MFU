const mongo = require('mongodb');
const Artwork = require('../controller/artwork');
const ResMessage = require("../../Settings/service/message");

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        const doc = await Artwork.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        const doc = await Artwork.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async function (request, response) {
    try {

        const doc = await Artwork.onCreate(request.body);
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

        const doc = await Artwork.onUpdate(query, request.body);
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
        const doc = await Artwork.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
