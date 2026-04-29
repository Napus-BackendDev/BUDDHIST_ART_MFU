const mongo = require('mongodb');
const Submission = require('../controller/submission');
const Status = require('../../Settings/models/status.model');
const Artwork = require("../../Artwork/models/artwork.model");
const User = require("../../User/models/user.model");
const ResMessage = require("../../Settings/service/message");
const { sendMail } = require("../../../../helpers/google/Mail");
const { approvedSubmissionMail, rejectedSubmissionMail } = require("../../Mail");

/** 
 * HELPER FUNCTIONS (Internal)
 */

// Extract artworks from a submission document matching a specific status ID
const getArtworksByStatus = (doc, statusId) => {
    if (!doc?.assignments || !statusId) return [];
    const targetId = statusId.toString();
    
    return doc.assignments.flatMap(assignment => 
        (assignment.artworks || []).filter(artwork => {
            const currentId = (artwork.status?._id || artwork.status)?.toString();
            return currentId === targetId;
        })
    );
};

// Process email notifications and listing on Sell Page for approved artworks
const processApprovals = async (doc, approvedArtworks, statuses) => {
    const { Approved, Available } = statuses;
    if (!Approved || approvedArtworks.length === 0 || !doc.artist?.length) return;

    for (const artist of doc.artist) {
        const email = artist.contact?.studentEmail || artist.email;
        if (!email) continue;

        const artistName = (artist.name && artist.name[0]?.value) || "Artist";
        const submissionTitle = (doc.title && doc.title[0]?.value) || "Your Artwork";
        const html = approvedSubmissionMail({ 
            artistName, 
            submissionTitle, 
            approvalDate: new Date().toLocaleString() 
        });

        await sendMail(email, 'Submission Approved - Buddhist Art MFU', '', html);
        console.log(`Approval email sent to ${email}`);

        // List approved artworks in the main collection
        for (const artwork of approvedArtworks) {
            const existing = await Artwork.findOne({ image: artwork.image });
            if (existing) continue;

            await Artwork.create({
                image: artwork.image,
                title: artwork.title,
                description: artwork.description,
                artist: artist._id,
                technique: artwork.technique,
                size: artwork.size,
                price: artwork.price || 0,
                category: artwork.category,
                status: {
                    approval: Approved._id,
                    sale: Available?._id || null
                }
            });
        }
    }
};

// Process email notifications for rejected artworks
const processRejections = async (doc, rejectedArtworks) => {
    if (rejectedArtworks.length === 0 || !doc.artist?.length) return;

    for (const artist of doc.artist) {
        const email = artist.contact?.studentEmail || artist.email;
        if (!email) continue;

        const artistName = (artist.name && artist.name[0]?.value) || "Artist";
        const submissionTitle = (doc.title && doc.title[0]?.value) || "Your Artwork";
        const html = rejectedSubmissionMail({ 
            artistName, 
            submissionTitle, 
            reason: "Does not meet our current collection requirements." 
        });

        await sendMail(email, 'Update on Your Submission - Buddhist Art MFU', '', html);
    }
};

// Handle student status transition (NewStudent -> OldStudent) after deadline
const processStudentStatus = async (doc, statuses) => {
    const { NewStudent, OldStudent } = statuses;
    const now = new Date();
    const endDate = doc.create?.endAt;

    if (!endDate || now <= endDate || !NewStudent || !OldStudent || !doc.artist?.length) return;

    for (const artist of doc.artist) {
        const artistId = artist._id || artist;
        
        // Check if artist participated in this submission
        const hasSubmitted = (doc.assignments || []).some(assign => 
            (assign.artworks || []).some(aw => {
                const ownerId = (aw.owner?._id || aw.owner)?.toString();
                return ownerId === artistId.toString();
            })
        );

        if (hasSubmitted) {
            const updated = await User.findOneAndUpdate(
                { _id: artistId, status: NewStudent._id },
                { status: OldStudent._id },
                { new: true }
            );
        }
    }
};

/**
 * EXPORTED SERVICE METHODS
 */

exports.onQuery = async (request, response) => {
    try {
        const query = { _id: new mongo.ObjectId(request.body._id) };
        const doc = await Submission.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async (request, response) => {
    try {
        const doc = await Submission.onQuerys(request.query || {});
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async (request, response) => {
    try {
        const doc = await Submission.onCreate(request.body);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error("Create Error:", err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpdate = async (request, response) => {
    try {
        const query = { _id: new mongo.ObjectId(request.body._id) };
        const doc = await Submission.onUpdate(query, request.body);
        if (!doc) return ResMessage.sendResponse(response, 0, 40400);

        // Fetch all relevant statuses in parallel
        const statusValues = ["Approved", "Rejected", "Available", "NewStudent", "OldStudent"];
        const statusDocs = await Status.find({ "title.value": { $in: statusValues } });
        
        const statuses = statusDocs.reduce((acc, s) => {
            const titleEn = s.title.find(t => t.key === 'en')?.value;
            if (titleEn) acc[titleEn] = s;
            return acc;
        }, {});

        // Extract artworks by category
        const approvedArtworks = getArtworksByStatus(doc, statuses.Approved?._id);
        const rejectedArtworks = getArtworksByStatus(doc, statuses.Rejected?._id);

        // Process various side-effects
        await Promise.all([
            processApprovals(doc, approvedArtworks, statuses),
            processRejections(doc, rejectedArtworks),
            processStudentStatus(doc, statuses)
        ]);

        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error("Update Error:", err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onDelete = async (request, response) => {
    try {
        const query = { _id: new mongo.ObjectId(request.body._id) };
        const doc = await Submission.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpload = async (request, response) => {
    try {
        if (!request.file && !request.files) {
            return ResMessage.sendResponse(response, 0, 40400, "No file uploaded");
        }

        const filename = request.file ? request.file.filename : request.files[0].filename;
        const imagePath = `${request.protocol}://${request.get('host')}/data/uploads/submission/${filename}`;

        return ResMessage.sendResponse(response, 0, 20000, { url: imagePath });
    } catch (err) {
        console.error("Upload Error:", err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
