const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const objsSchema = new Schema({
    title: [{
        key: { type: String, default: null },
        value: { type: String, default: null },
    }],
    description: [{
        key: { type: String, default: null },
        value: { type: String, default: null },
    }],
    submissionCode: { type: String, default: null },
    courseLevel: { type: String, default: "1" },
    academicYear: { type: String, default: () => String(new Date().getFullYear() + 543), index: true },
    artist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignments: [{
        title: [{
            key: { type: String, default: null },
            value: { type: String, default: null },
        }],
        artist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        create: {
            startAt: { type: Date, default: Date.now },
            endAt: { type: Date, default: Date.now },
        },
        artworks: [{
            // Stable form response identity; titles can repeat for the same artist.
            importKey: { type: String, default: null },
            artworkCode: { type: String, default: null },
            title: [{
                key: { type: String, default: null },
                value: { type: String, default: null },
            }],
            description: [{
                key: { type: String, default: null },
                value: { type: String, default: null },
            }],
            technique: [{
                key: { type: String, default: null },
                value: { type: String, default: null }
            }],
            size: [{
                key: { type: String, default: null },
                value: { type: String, default: null }
            }],
            price: { type: Number, default: 0 },
            status: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status' },
            image: { type: String, default: null },
            owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
            category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
            report: { type: String, default: null },
            remark: [{
                key: { type: String, default: null },
                value: { type: String, default: null },
            }],
            rejectionReason: { type: String, default: null },
            storage: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Storage', default: null },
            storageDetail: { type: String, trim: true, default: '' },
            create: {
                at: { type: Date, default: Date.now },
            },
        }],
    }],
    create: {
        startAt: { type: Date, default: Date.now },
        // No default deadline: a submission saved without an explicit endAt must NOT be
        // treated as already past-deadline (which would instantly flip its artists to
        // OldStudent). processStudentStatus and the cron both skip a missing endAt.
        endAt: { type: Date },
    },
}, { timestamps: true });

objsSchema.index(
    { submissionCode: 1 },
    { unique: true, partialFilterExpression: { submissionCode: { $type: 'string' } } }
);

module.exports = mongoose.model('Submission', objsSchema, 'Submission');
