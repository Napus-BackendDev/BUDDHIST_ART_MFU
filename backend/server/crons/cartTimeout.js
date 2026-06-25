const cron = require('node-cron');
const mongoose = require('mongoose');
const Artwork = require('../Project/Artwork/models/artwork.model');
const Order = require('../Project/Order/models/order.model');
const Status = require('../Project/Settings/models/status.model');

module.exports = function() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            // 1. Find the necessary status IDs
            const allStatuses = await Status.find({
                'title.value': { $in: ['Reserved', 'Approved', 'Available', 'Rejected', 'Cancelled', 'Pending'] }
            });

            const getStatusId = (name) => allStatuses.find(s => s.title.some(t => t.value === name))?._id;

            const orderReservedStatus = getStatusId('Reserved') || getStatusId('Pending');
            const orderCancelledStatus = getStatusId('Cancelled') || getStatusId('Rejected');
            const artworkAvailableStatus = getStatusId('Available');
            const artworkApprovedStatus = getStatusId('Approved');

            if (!orderReservedStatus || !orderCancelledStatus || !artworkAvailableStatus || !artworkApprovedStatus) {
                return;
            }

            // 2. Calculate timeout threshold (24 hours ago)
            const timeoutThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // 3. Find Orders that have timed out AND have no payment slip
            // Also include the fallback default status ID "689c04cb255db4e56aea88ef"
            const expiredOrders = await Order.find({
                status: { $in: [orderReservedStatus, mongoose.Types.ObjectId('689c04cb255db4e56aea88ef')] },
                createdAt: { $lt: timeoutThreshold },
                $or: [
                    { image: { $exists: false } },
                    { image: null },
                    { image: "" }
                ]
            });

            if (expiredOrders.length === 0) return;

            console.log(`[Cron] Found ${expiredOrders.length} expired orders. Processing...`);

            for (const order of expiredOrders) {
                // A. Release Artworks in this order: set sale to Available and approval to Approved
                if (order.artwork && order.artwork.length > 0) {
                    await Artwork.updateMany(
                        { _id: { $in: order.artwork } },
                        { 
                            $set: { 
                                'status.sale': artworkAvailableStatus,
                                'status.approval': artworkApprovedStatus
                            } 
                        }
                    );
                }

                // B. Cancel the Order
                order.status = orderCancelledStatus;
                // Add a remark so admin knows it was auto-cancelled
                order.remark = "Auto-cancelled due to 24-hour payment timeout.";
                await order.save();
                
                console.log(`[Cron] Order ${order.orderNumber || order._id} has been auto-cancelled.`);
            }

        } catch (error) {
            console.error('[Cron] Error running cart timeout cron:', error);
        }
    });
};
