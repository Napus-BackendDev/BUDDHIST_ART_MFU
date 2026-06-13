const mongo = require("mongodb");
const Artwork = require("../controller/artwork");
const ArtworkModel = require("../models/artwork.model");
const User = require("../../User/models/user.model");
const ResMessage = require("../../Settings/service/message");

const generateArtworkCode = async (artistId) => {
  if (!artistId) return null;
  try {
    const artist = await User.findById(artistId);
    if (!artist) return null;
    const beYear = (new Date().getFullYear() + 543) % 100;
    const yy = String(beYear).padStart(2, '0');
    const c = "1"; // Default course level for manual registration
    const studentId = artist.studentId || "";
    const aa = studentId.length >= 2 ? studentId.substring(studentId.length - 2) : "00";
    const count = await ArtworkModel.countDocuments({ artist: artistId });
    const nnn = String(count + 1).padStart(3, '0');
    return `${yy}8${c}${aa}${nnn}`;
  } catch (err) {
    console.error("Error generating artwork code:", err);
    return null;
  }
};

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

    const cleanObject = async (obj) => {
      if (obj.status) {
        if (obj.status.approval === "") delete obj.status.approval;
        if (obj.status.sale === "") delete obj.status.sale;
      }
      if (obj.category === "") delete obj.category;
      if (obj.artist === "") delete obj.artist;

      // DEFENSIVE: Ensure remark is saved correctly
      if (obj.remark) {
        if (!Array.isArray(obj.remark) && typeof obj.remark === 'object') {
          obj.remark = [
            { key: 'en', value: obj.remark.en || "" },
            { key: 'th', value: obj.remark.th || "" }
          ];
        } else if (Array.isArray(obj.remark)) {
          obj.remark = obj.remark.filter(item => item && item.key !== undefined);
        }
      } else {
        obj.remark = [
          { key: 'en', value: "" },
          { key: 'th', value: "" }
        ];
      }

      // Generate artworkCode if not already present
      if (!obj.artworkCode && obj.artist) {
        obj.artworkCode = await generateArtworkCode(obj.artist);
      }

      return obj;
    };

    if (isArray) {
      const results = [];
      for (const item of data) {
        const cleaned = await cleanObject(item);
        const doc = await Artwork.onCreate(cleaned);
        results.push(doc);
      }
      return ResMessage.sendResponse(response, 0, 20000, results);
    } else {
      const cleaned = await cleanObject(data);
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

    // ใช้ Helper แทนการ Hardcode path
    const imagePath = Artwork.getImageUrl(request, request.file.destination, request.file.filename);

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

    if (request.body.previousApprovalId) {
      query['status.approval'] = new mongo.ObjectId(request.body.previousApprovalId);
    }

    const data = { ...request.body };
    delete data._id; // IMPORTANT: Remove immutable _id before updating

    // Clean up empty strings for ObjectId fields to allow schema defaults/nulls to work
    if (data.status) {
      if (data.status.approval === "") delete data.status.approval;
      if (data.status.sale === "") delete data.status.sale;
    }
    if (data.category === "") delete data.category;
    if (data.artist === "") delete data.artist;
    if (data.previousApprovalId) delete data.previousApprovalId;

    // DEFENSIVE: Ensure remark is saved correctly as a bilingual array
    if (data.remark) {
      if (!Array.isArray(data.remark) && typeof data.remark === 'object') {
        // Convert standard object {en: '...', th: '...'} to array
        data.remark = [
          { key: 'en', value: data.remark.en || "" },
          { key: 'th', value: data.remark.th || "" }
        ];
      } else if (Array.isArray(data.remark)) {
        // It's already an array, ensure it has valid structure
        data.remark = data.remark.filter(item => item && item.key !== undefined);
      }
    } else {
      data.remark = [
        { key: 'en', value: "" },
        { key: 'th', value: "" }
      ];
    }

    const doc = await Artwork.onUpdate(query, data);

    if (!doc && request.body.previousApprovalId) {
      return ResMessage.sendResponse(response, 0, 40000, null); // Bad Request (Already taken)
    }

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
