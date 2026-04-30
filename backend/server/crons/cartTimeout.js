const cron = require('node-cron');
const mongoose = require('mongoose');
const Artwork = require('../Project/Artwork/models/artwork.model');
const Status = require('../Project/Settings/models/status.model');

module.exports = function() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            // Find the "In Cart" and "Approved" status IDs
            const statuses = await Status.find({
                $or: [
                    { 'title.value': 'In Cart' },
                    { 'title.value': 'Approved' }
                ]
            });

            const inCartStatus = statuses.find(s => s.title && s.title.some(t => t.value === 'In Cart'));
            const approvedStatus = statuses.find(s => s.title && s.title.some(t => t.value === 'Approved'));

            if (!inCartStatus || !approvedStatus) {
                return;
            }

            // Calculate time 15 minutes ago
            const timeoutThreshold = new Date(Date.now() - 15 * 60 * 1000);

            // Find and update artworks
            const result = await Artwork.updateMany(
                { 
                    'status.approval': inCartStatus._id,
                    updatedAt: { $lt: timeoutThreshold }
                },
                { 
                    $set: { 'status.approval': approvedStatus._id }
                }
            );

            // Mongoose 5 uses nModified
            if (result && result.nModified > 0) {
                console.log(`[Cron] Released ${result.nModified} orphaned artworks from cart due to 15-minute timeout.`);
            }
        } catch (error) {
            console.error('[Cron] Error running cart timeout cron:', error);
        }
    });
};
