const cron = require('node-cron');
const mongoose = require('mongoose');
const Artwork = require('../Project/Artwork/models/artwork.model');
const Order = require('../Project/Order/models/order.model');
const Status = require('../Project/Settings/models/status.model');
const { getEffectiveMode, constants } = require('../Project/Artwork/service/postTermSale');

module.exports = function() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            // 1. Find the necessary status IDs
            const allStatuses = await Status.find({
                'title.value': { $in: ['Reserved', 'Approved', 'Available', 'Exhibition', 'Rejected', 'Cancelled', 'Pending'] }
            });

            const getStatusId = (name) => allStatuses.find(s => s.title.some(t => t.value === name))?._id;

            const orderReservedStatus = getStatusId('Reserved');
            const orderCancelledStatus = getStatusId('Cancelled');
            const artworkAvailableStatus = getStatusId('Available');
            const artworkExhibitionStatus = getStatusId('Exhibition');
            const artworkApprovedStatus = getStatusId('Approved');

            if (!orderReservedStatus || !orderCancelledStatus || !artworkAvailableStatus || !artworkApprovedStatus) {
                return;
            }

            // 2. Calculate timeout threshold (24 hours ago)
            const timeoutThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // 3. Find Orders that have timed out AND have no payment slip
            // Also include the fallback default status ID "689c04cb255db4e56aea88ef"
            const expiredOrders = await Order.find({
                status: orderReservedStatus,
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
                // Claim order first. Payment upload/approval can race this cron;
                // only the request that still sees Reserved may cancel it.
                const claimedOrder = await Order.findOneAndUpdate(
                    {
                        _id: order._id,
                        status: orderReservedStatus,
                        $or: [
                            { image: { $exists: false } },
                            { image: null },
                            { image: "" }
                        ]
                    },
                    {
                        $set: {
                            status: orderCancelledStatus,
                            remark: "Auto-cancelled due to 24-hour payment timeout."
                        }
                    },
                    { new: true }
                );
                if (!claimedOrder) continue;

                // Release only artworks still marked Reserved. A post-term
                // display-only artwork must return to Exhibition, never Available.
                if (order.artwork && order.artwork.length > 0) {
                    for (const artworkId of order.artwork) {
                        const artwork = await Artwork.findOne({ _id: artworkId, 'status.approval': orderReservedStatus })
                            .select('postTermSale')
                            .lean();
                        if (!artwork) continue;
                        const displayOnly = getEffectiveMode(artwork.postTermSale) === constants.MODES.DISPLAY;
                        await Artwork.updateOne(
                            { _id: artworkId, 'status.approval': orderReservedStatus },
                            {
                                $set: {
                                    'status.sale': displayOnly && artworkExhibitionStatus
                                        ? artworkExhibitionStatus
                                        : artworkAvailableStatus,
                                    'status.approval': artworkApprovedStatus
                                }
                            }
                        );
                    }
                }

                console.log(`[Cron] Order ${claimedOrder.orderNumber || claimedOrder._id} has been auto-cancelled.`);
            }

        } catch (error) {
            console.error('[Cron] Error running cart timeout cron:', error);
        }
    });
};
