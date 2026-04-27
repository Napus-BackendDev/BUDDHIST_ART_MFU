const mongo = require("mongodb");
const Artwork = require("../controller/artwork");
const ResMessage = require("../../Settings/service/message");

exports.onQuery = async function (request, response) {
  try {
    let query = {};
    query._id = new mongo.ObjectId(request.body._id);
    
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
    const isArray = Array.isArray(request.body);
    const data = isArray ? request.body : { ...request.body };

    const cleanObject = (obj) => {
      if (obj.status) {
        if (obj.status.approval === "") delete obj.status.approval;
        if (obj.status.sale === "") delete obj.status.sale;
      }
      if (obj.category === "") delete obj.category;
      if (obj.artist === "") delete obj.artist;
      return obj;
    };

    if (isArray) {
      const results = [];
      for (const item of data) {
        const cleaned = cleanObject(item);
        const doc = await Artwork.onCreate(cleaned);
        results.push(doc);
      }
      console.log(`Backend Bulk Create - Success count: ${results.length}`);
      return ResMessage.sendResponse(response, 0, 20000, results);
    } else {
      const cleaned = cleanObject(data);
      const doc = await Artwork.onCreate(cleaned);
      return ResMessage.sendResponse(response, 0, 20000, doc);
    }
  } catch (err) {
    console.log(err);
    return ResMessage.sendResponse(response, 0, 40400);
  }
};

exports.onUpload = async function (request, response) {
  try {
    let query = {};
    query._id = new mongo.ObjectId(request.body._id);
    const imagePath = `${request.protocol}://${request.get('host')}/uploads/artwork/${request.file.filename}`;

    const doc = await Artwork.onUpdate(query, { image: imagePath }, [], "image");
    return ResMessage.sendResponse(response, 0, 20000, doc);
  } catch (err) {
    console.log(err);
    return ResMessage.sendResponse(response, 0, 40400);
  }
};

exports.onUpdate = async function (request, response) {
  try {
    let query = {};
    query._id = new mongo.ObjectId(request.body._id);

    const data = { ...request.body };
    // Clean up empty strings for ObjectId fields to allow schema defaults/nulls to work
    if (data.status) {
      if (data.status.approval === "") delete data.status.approval;
      if (data.status.sale === "") delete data.status.sale;
    }
    if (data.category === "") delete data.category;
    if (data.artist === "") delete data.artist;

    const doc = await Artwork.onUpdate(query, data);
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
