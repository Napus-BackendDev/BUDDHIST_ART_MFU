const cron = require('node-cron');
const { runJob } = require('../Project/Artwork/service/postTermSale');

module.exports = function startPostTermSaleJob() {
    // Minute cadence keeps the cutoff and reminders close to the Submission
    // timestamp. All writes are guarded/idempotent inside runJob.
    return cron.schedule('* * * * *', async () => {
        try {
            const result = await runJob(new Date());
            if (result.transitioned || result.reminded) {
                console.log(`[PostTermSale Cron] transitioned=${result.transitioned} reminded=${result.reminded}`);
            }
        } catch (error) {
            console.error('[PostTermSale Cron] Error:', error);
        }
    });
};
