const mongo = require("mongodb");
const Artwork = require("../controller/artwork");
const ArtworkModel = require("../models/artwork.model");
const User = require("../../User/models/user.model");
const ResMessage = require("../../Settings/service/message");
const { generateArtworkCode } = require('./artworkCode');
const { getEffectiveMode, isAdminUser, requestUserId, constants } = require('./postTermSale');

const generateDirectArtworkCode = async (artistId, courseLevel, academicYear) => {
  if (!artistId) return null;
  try {
    const artist = await User.findById(artistId);
    if (!artist) return null;
    return generateArtworkCode({ artist, courseLevel, academicYear });
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

exports.onUpdateView = async function (request, response) {
  try {
    const artworkId = new mongo.ObjectId(request.params.id);
    const doc = await ArtworkModel.findByIdAndUpdate(
      artworkId,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

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
      // Post-term lifecycle is written only by the dedicated decision API.
      // Direct artwork creation must never opt into Submission's one-year rule.
      delete obj.postTermSale;
      delete obj.submissionArtworkId;
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
        obj.academicYear = String(obj.academicYear || (new Date().getFullYear() + 543));
        obj.courseLevel = String(obj.courseLevel || '00');
        obj.artworkCode = await generateDirectArtworkCode(obj.artist, obj.courseLevel, obj.academicYear);
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

    // During the initial Submission term, artists may edit artwork metadata but
    // cannot turn off the platform's sale right. Admins retain control.
    const currentArtwork = await ArtworkModel.findOne(query).lean();
    if (currentArtwork?.postTermSale?.applicable
      && !isAdminUser(request)
      && String(currentArtwork.artist) === String(requestUserId(request))
      && getEffectiveMode(currentArtwork.postTermSale) === constants.MODES.INITIAL
      && data.status && Object.prototype.hasOwnProperty.call(data.status, 'sale')) {
      data.status.sale = currentArtwork.status?.sale;
    }
    delete data.postTermSale;

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

    // --- 📧 ส่งอีเมลแจ้งเตือนศิลปินเมื่อผลงานไม่ได้รับการอนุมัติ (Rejected) ---
    if (doc && doc.status && doc.status.approval) {
      try {
        const populatedArtwork = await ArtworkModel.findById(doc._id)
          .populate('status.approval')
          .populate('artist')
          .lean();

        const isRejected = populatedArtwork.status?.approval?.title?.some(t => t.value === 'Rejected' || t.value === 'ไม่นุมัติ');
        if (isRejected) {
          const email = populatedArtwork.artist?.contact?.studentEmail || populatedArtwork.artist?.contact?.personalEmail;
          if (email) {
            const { sendMail } = require("../../../../helpers/google/Mail");
            const { rejectedSubmissionMail } = require("../../Mail");
            
            const artistName = (populatedArtwork.artist?.name && populatedArtwork.artist.name[0]?.value) || "Artist";
            const artworkTitle = (populatedArtwork.title && populatedArtwork.title[0]?.value) || "Your Artwork";
            
            const html = rejectedSubmissionMail({
              artistName,
              submissionTitle: artworkTitle,
              reason: doc.rejectionReason || "Does not meet our current collection requirements."
            });

            await sendMail(email, 'แจ้งสถานะการประเมินผลงานสร้างสรรค์ - พุทธศิลปกรรม มฟล.', '', html);
            console.log(`[Artwork] Rejection email sent successfully to artist: ${email}`);
          }
        }
      } catch (emailErr) {
        console.error("[Artwork Rejection Email Error]:", emailErr.message);
      }
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
