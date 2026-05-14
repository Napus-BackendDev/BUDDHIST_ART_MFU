const mongo = require('mongodb');
const Submission = require('../controller/submission');
const Status = require('../../Settings/models/status.model');
const Artwork = require("../../Artwork/models/artwork.model");
const User = require("../../User/models/user.model");
const Role = require("../../Settings/models/role.model");
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
    
    return doc.assignments.flatMap(assignment => {
        // Get assignment title for metadata
        const assignmentTitle = (assignment.title && assignment.title.find(t => t.key === 'th')?.value) || (assignment.title && assignment.title[0]?.value) || "";
        
        return (assignment.artworks || [])
            .filter(artwork => {
                const currentId = (artwork.status?._id || artwork.status)?.toString();
                return currentId === targetId;
            })
            .map(artwork => {
                // Convert to plain object if it's a Mongoose document to allow adding temp properties
                const artObj = artwork.toObject ? artwork.toObject() : JSON.parse(JSON.stringify(artwork));
                return {
                    ...artObj,
                    _assignmentTitle: assignmentTitle // Attach assignment title for later use
                };
            });
    });
};

// Process email notifications and listing on Sell Page for approved artworks
const processApprovals = async (doc, approvedArtworks, statuses) => {
    const { Approved, Available } = statuses;
    if (!Approved || approvedArtworks.length === 0) return;

    // Group approved artworks by owner to prevent duplicate emails and wrong assignments
    const ownerMap = new Map();
    approvedArtworks.forEach(art => {
        const ownerId = (art.owner?._id || art.owner)?.toString();
        if (!ownerId) return;
        if (!ownerMap.has(ownerId)) ownerMap.set(ownerId, []);
        ownerMap.get(ownerId).push(art);
    });

    for (const [ownerId, artworks] of ownerMap) {
        // Find the artist object from populated list
        const artist = doc.artist.find(a => a._id.toString() === ownerId);
        if (!artist) continue;

        const email = artist.contact?.studentEmail || artist.email;

        // Process each approved artwork 1-by-1
        for (const artwork of artworks) {
            const artworkId = artwork._id ? artwork._id.toString() : 'unknown';
            
            // Dual Check: Prevent duplicates by checking both the internal ID and the image URL
            // This handles both new records and older records created before the ID system was added
            const existing = await Artwork.findOne({ 
                $or: [
                    { submissionArtworkId: artwork._id },
                    { image: artwork.image }
                ]
            });

            if (existing) {
                console.log(`[Submission] Artwork ${artworkId} already published (found by ID or Image). Skipping.`);
                continue;
            }

            console.log(`[Submission] Processing NEW approval for Artwork ${artworkId}...`);

            // Send notification ONLY for the newly approved artwork
            if (email) {
                const artistName = (artist.name && artist.name[0]?.value) || "Artist";
                const artworkTitle = (artwork.title && artwork.title[0]?.value) || "Your Artwork";
                const html = approvedSubmissionMail({ 
                    artistName, 
                    submissionTitle: artworkTitle,
                    approvalDate: new Date().toLocaleString() 
                });

                try {
                    await sendMail(email, `Artwork Approved: ${artworkTitle} - Buddhist Art MFU`, '', html);
                    console.log(`[Submission] Approval email sent to ${email} for: ${artworkTitle}`);
                } catch (mailError) {
                    console.error(`[Submission] Failed to send email to ${email}:`, mailError.message);
                }
            }

            // Publish to main Artwork collection
            const subTitle = (doc.title && doc.title.find(t => t.key === 'th')?.value) || (doc.title && doc.title[0]?.value) || "";
            const assignTitle = artwork._assignmentTitle || "";
            const combinedPiece = subTitle + (assignTitle ? ` - ${assignTitle}` : "");

            await Artwork.create({
                submissionArtworkId: artwork._id, // Track provenance
                artworkPiece: combinedPiece,
                image: artwork.image,
                title: artwork.title,
                description: artwork.description,
                remark: artwork.remark,
                artist: ownerId,
                technique: artwork.technique,
                size: artwork.size,
                price: artwork.price || 0,
                category: artwork.category,
                status: {
                    approval: Approved._id,
                    sale: Available?._id || null
                }
            });
            console.log(`[Submission] Successfully published artwork ${artworkId} to main collection.`);
        }
    }
};

// Process email notifications for rejected artworks
const processRejections = async (doc, rejectedArtworks) => {
    if (rejectedArtworks.length === 0) return;

    // Group rejected artworks by owner
    const ownerIds = [...new Set(rejectedArtworks.map(art => (art.owner?._id || art.owner)?.toString()).filter(id => !!id))];

    for (const ownerId of ownerIds) {
        const artist = doc.artist.find(a => a._id.toString() === ownerId);
        if (!artist) continue;

        const email = artist.contact?.studentEmail || artist.email;
        if (!email) continue;

        const artistName = (artist.name && artist.name[0]?.value) || "Artist";
        const submissionTitle = (doc.title && doc.title[0]?.value) || "Your Artwork";
        
        // ดึงเหตุผลจาก artwork ชิ้นแรกที่ถูก Reject (หรือรวมจากหลายชิ้นก็ได้ แต่เบื้องต้นดึงจากตัวแรกที่มีเหตุผล)
        const specificReason = rejectedArtworks.find(art => art.rejectionReason)?.rejectionReason;
        const finalReason = specificReason || "Does not meet our current collection requirements.";

        const html = rejectedSubmissionMail({ 
            artistName, 
            submissionTitle, 
            reason: finalReason 
        });

        await sendMail(email, 'Update on Your Submission - Buddhist Art MFU', '', html);
        console.log(`Rejection email sent to ${email}`);
    }
};

// Handle student status transition (NewStudent -> OldStudent) after deadline
const processStudentStatus = async (doc, statuses, roles) => {
    const { NewStudent, OldStudent } = statuses;
    const { Artist } = roles;
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
                { 
                    _id: artistId, 
                    status: NewStudent._id,
                    role: Artist?._id 
                },
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

        // Fetch Artist role ID
        const roleDocs = await Role.find({ "title.value": "Artist" });
        const roles = roleDocs.reduce((acc, r) => {
            const titleEn = r.title.find(t => t.key === 'en')?.value;
            if (titleEn) acc[titleEn] = r;
            return acc;
        }, {});

        // Extract artworks by category
        const approvedArtworks = getArtworksByStatus(doc, statuses.Approved?._id);
        const rejectedArtworks = getArtworksByStatus(doc, statuses.Rejected?._id);

        // Process various side-effects
        await Promise.all([
            processApprovals(doc, approvedArtworks, statuses),
            processRejections(doc, rejectedArtworks),
            processStudentStatus(doc, statuses, roles)
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
        const destination = request.file ? request.file.destination : request.files[0].destination;
        const imagePath = Submission.getImageUrl(request, destination, filename);

        return ResMessage.sendResponse(response, 0, 20000, { url: imagePath });
    } catch (err) {
        console.error("Upload Error:", err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
