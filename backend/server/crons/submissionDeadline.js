const cron = require('node-cron');
const Submission = require('../Project/Submission/models/submission.model');
const User = require('../Project/User/models/user.model');
const Status = require('../Project/Settings/models/status.model');
const Role = require('../Project/Settings/models/role.model');
const { STATUS_CODES } = require('../Project/Settings/statusCodes');

module.exports = function() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            // Query all expired submissions
            const expiredSubmissions = await Submission.find({
                'create.endAt': { $lt: now }
            }).select('artist');

            if (expiredSubmissions.length === 0) return;

            // Extract all enrolled artist IDs from these submissions
            const artistIds = [];
            for (const sub of expiredSubmissions) {
                if (sub.artist && sub.artist.length > 0) {
                    for (const artId of sub.artist) {
                        artistIds.push(artId);
                    }
                }
            }

            if (artistIds.length === 0) return;

            // Find NewStudent, OldStudent statuses and Artist role
            const statusDocs = await Status.find({
                $or: [
                    { code: { $in: [STATUS_CODES.NEW_STUDENT, STATUS_CODES.OLD_STUDENT] } },
                    { 'title.value': { $in: ['NewStudent', 'OldStudent'] } }
                ]
            });
            const getStatusId = (name) => {
                const code = String(name).toUpperCase().replace(/ /g, '_');
                return statusDocs.find(s => s.code === code)?._id || statusDocs.find(s => s.title.some(t => t.value === name))?._id;
            };
            const newStudentStatusId = getStatusId('NewStudent');
            const oldStudentStatusId = getStatusId('OldStudent');

            const roleDoc = await Role.findOne({
                'title.value': 'Artist'
            });
            const artistRoleId = roleDoc?._id;

            if (!newStudentStatusId || !oldStudentStatusId || !artistRoleId) {
                return;
            }

            // Transition statuses from NewStudent to OldStudent if they have the Artist role, using updateMany
            const result = await User.updateMany(
                {
                    _id: { $in: artistIds },
                    status: newStudentStatusId,
                    role: artistRoleId
                },
                {
                    $set: { status: oldStudentStatusId }
                }
            );

            if (result && (result.modifiedCount || result.nModified || 0) > 0) {
                console.log(`[Cron] Transitioned ${(result.modifiedCount || result.nModified)} artist(s) from NewStudent to OldStudent.`);
            }

        } catch (error) {
            console.error('[Cron] Error running submission deadline cron:', error);
        }
    });
};
