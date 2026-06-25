'use strict';

var mongo = require('mongodb');
var Storage = require('../controller/storage');
const resMsg = require("../service/message");

exports.onQuerys = async function (request, response, next) {
    try {
        var querys = request.body || {};
        const doc = await Storage.onQuerys(querys);

        var resData = await resMsg.onMessage_Response(0, 20000);
        resData.data = doc;
        response.status(200).json(resData);

    } catch (err) {
        var resData = await resMsg.onMessage_Response(0, 40400);
        response.status(404).json(resData);
    }
};

exports.onCreate = async function (request, response, next) {
    try {
        const doc = await Storage.onCreate(request.body);
        var resData = await resMsg.onMessage_Response(0, 20000);
        resData.data = doc;
        response.status(200).json(resData);

    } catch (err) {
        var resData = await resMsg.onMessage_Response(0, 40400);
        response.status(404).json(resData);
    }
};

exports.onUpdate = async function (request, response, next) {
    try {
        var query = {};
        const { _id, ...updateData } = request.body;
        query._id = new mongo.ObjectId(_id);
        const doc = await Storage.onUpdate(query, updateData);

        var resData = await resMsg.onMessage_Response(0, 20000);
        resData.data = doc;
        response.status(200).json(resData);

    } catch (err) {
        var resData = await resMsg.onMessage_Response(0, 40400);
        response.status(404).json(resData);
    }
};

exports.onDelete = async function (request, response, next) {
    try {
        var query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const doc = await Storage.onDelete(query);

        var resData = await resMsg.onMessage_Response(0, 20000);
        resData.data = doc;
        response.status(200).json(resData);

    } catch (err) {
        var resData = await resMsg.onMessage_Response(0, 40400);
        response.status(404).json(resData);
    }
};
