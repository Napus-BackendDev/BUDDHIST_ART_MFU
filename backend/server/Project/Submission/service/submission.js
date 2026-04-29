const mongo = require('mongodb');
const Submission = require('../controller/submission');
const Status = require('../../Settings/models/status.model');
const ResMessage = require("../../Settings/service/message");
const { sendMail } = require("../../../../helpers/google/Mail");
const { approvedSubmissionMail, rejectedSubmissionMail } = require("../../Mail");

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const doc = await Submission.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = request.query || {};
        const doc = await Submission.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async function (request, response) {
    try {

        const doc = await Submission.onCreate(request.body);
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

        // 1. Perform the update
        const doc = await Submission.onUpdate(query, request.body);
        if (!doc) return ResMessage.sendResponse(response, 0, 40400);

        // 2. Check for approval status change
        // We need to fetch the "Approved" status ID to compare
        const approvedStatus = await Status.findOne({ "title.value": "Approved" });
        const rejectedStatus = await Status.findOne({ "title.value": "Rejected" });

        if (approvedStatus) {
            console.log("Approved Status ID:", approvedStatus._id);
            
            const isApproved = doc.assignments?.some(assignment =>
                assignment.artworks?.some(artwork => {
                    const statusId = artwork.status?._id || artwork.status;
                    const match = statusId && statusId.toString() === approvedStatus._id.toString();
                    if (match) console.log("Found Approved Artwork:", artwork.title || artwork._id);
                    return match;
                })
            );

            console.log("Is Submission Approved:", isApproved);

            if (isApproved && doc.artist && doc.artist.length > 0) {
                console.log("Detected Artists:", doc.artist.length);
                for (const artist of doc.artist) {
                    const email = artist.contact?.studentEmail || artist.email;
                    console.log("Target Email:", email);
                    if (email) {
                        const artistName = (artist.name && artist.name[0]?.value) || "Artist";
                        const submissionTitle = (doc.title && doc.title[0]?.value) || "Your Artwork";
                        const approvalDate = new Date().toLocaleString();

                        const html = approvedSubmissionMail({
                            artistName,
                            submissionTitle,
                            approvalDate
                        });

                        await sendMail(email, 'Submission Approved - Buddhist Art MFU', '', html);
                        console.log(`Approval email sent to ${email}`);
                    }
                }
            }
        } else {
            console.warn("Warning: 'Approved' status not found in database.");
        }

        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error("Update Error:", err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onDelete = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const doc = await Submission.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpload = async function (request, response) {
    try {
        if (!request.file && !request.files) {
            return ResMessage.sendResponse(response, 0, 40400, "No file uploaded");
        }

        let filename = request.file ? request.file.filename : request.files[0].filename;
        const imagePath = `${request.protocol}://${request.get('host')}/data/uploads/submission/${filename}`;

        // Return the url inside doc.url so the frontend can access uploadRes.data.data.url
        return ResMessage.sendResponse(response, 0, 20000, { url: imagePath });
    } catch (err) {
        console.error("Upload Error:", err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
