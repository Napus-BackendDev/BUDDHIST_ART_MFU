const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const objsSchema = new Schema({
    title: [{
        key: { type: String, default: null },
        value: { type: String, default: null },
    }],
    artist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignments: [{
        title: [{
            key: { type: String, default: null },
            value: { type: String, default: null },
        }],
        create: {
            startAt: { type: Date, default: Date.now },
            endAt: { type: Date, default: Date.now },
        },
        artworks: [{
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
            category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
            image: { type: String, default: null },
            owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            status: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status' },
            report: { type: String, default: null },
            remark: { type: String, default: null },
            rejectionReason: { type: String, default: null },
            create: {
                at: { type: Date, default: Date.now },
            },
        }],
    }],
    create: {
        startAt: { type: Date, default: Date.now },
        endAt: { type: Date, default: Date.now },
    },
}, { timestamps: true });

module.exports = mongoose.model('Submission', objsSchema, 'Submission');
