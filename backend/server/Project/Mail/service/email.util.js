const { sendMail } = require("../../../../helpers/google/Mail");
const approvedSubmissionMail = require("../template/approvedSubmission");
const rejectedSubmissionMail = require("../template/rejectedSubmission");
const Artwork = require("../../Artwork/models/artwork.model");
/** 
 * HELPER FUNCTIONS (Internal)
 */

// Extract artworks from a submission document matching a specific status ID, ensuring they changed status
const getNewlyChangedArtworks = (oldDoc, newDoc, statusId) => {
    if (!newDoc?.assignments || !statusId) return [];
    const targetId = statusId.toString();

    const oldArtworks = new Map();
    if (oldDoc?.assignments) {
        oldDoc.assignments.forEach(assignment => {
            (assignment.artworks || []).forEach(aw => {
                if (aw._id) {
                    oldArtworks.set(aw._id.toString(), (aw.status?._id || aw.status)?.toString());
                }
            });
        });
    }

    return newDoc.assignments.flatMap(assignment =>
        (assignment.artworks || []).filter(artwork => {
            if (!artwork._id) return false;
            const currentId = (artwork.status?._id || artwork.status)?.toString();
            const previousId = oldArtworks.get(artwork._id.toString());
            return currentId === targetId && previousId !== targetId;
        })
    );
};

// Process email notifications and listing on Sell Page for approved artworks
const processApprovals = async (doc, approvedArtworks, statuses) => {
    const { Approved, Available } = statuses;
    if (!Approved || approvedArtworks.length === 0) return;

    for (const artwork of approvedArtworks) {
        const ownerId = (artwork.owner?._id || artwork.owner)?.toString();

        // Find owner details. Can be artwork.owner if populated, or from doc.artist
        const artist = typeof artwork.owner === 'object' && artwork.owner.contact ? artwork.owner :
            (doc.artist || []).find(a => (a._id || a).toString() === ownerId);

        if (!artist) continue;

        const email = artist.contact?.studentEmail || artist.email;
        if (!email) continue;

        const existing = await Artwork.findOne({ image: artwork.image });
        if (!existing) {
            await Artwork.create({
                image: artwork.image,
                title: artwork.title,
                description: artwork.description,
                artist: artist._id || artist,
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

        const artistName = (artist.name && artist.name[0]?.value) || "Artist";
        const submissionTitle = (doc.title && doc.title[0]?.value) || "Your Artwork";
        const html = approvedSubmissionMail({
            artistName,
            submissionTitle,
            approvalDate: new Date().toLocaleString()
        });

        await sendMail(email, 'Submission Approved - Buddhist Art MFU', '', html);
        console.log(`Approval email sent to ${email}`);
    }
};

// Process email notifications for rejected artworks
const processRejections = async (doc, rejectedArtworks) => {
    if (rejectedArtworks.length === 0) return;

    for (const artwork of rejectedArtworks) {
        const ownerId = (artwork.owner?._id || artwork.owner)?.toString();
        const artist = typeof artwork.owner === 'object' && artwork.owner.contact ? artwork.owner :
            (doc.artist || []).find(a => (a._id || a).toString() === ownerId);

        if (!artist) continue;

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
        console.log(`Rejection email sent to ${email}`);
    }
};


module.exports = {
    getNewlyChangedArtworks,
    processApprovals,
    processRejections
};