const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postTermHistorySchema = new Schema({
    decision: { type: String, enum: ['pending', 'continue_sale', 'display_only'], required: true },
    mode: { type: String, enum: ['initial_term', 'standard_sale', 'display_only'], required: true },
    recordedAt: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    recordedAs: { type: String, enum: ['artist', 'admin', 'system'], required: true },
    contactMethod: { type: String, enum: ['portal', 'phone', 'email', 'in_person', 'system'], default: 'portal' },
    note: { type: String, trim: true, default: '' }
}, { _id: true });

const postTermSaleSchema = new Schema({
    applicable: { type: Boolean, default: false, index: true },
    needsReview: { type: Boolean, default: false, index: true },
    reviewReason: { type: String, trim: true, default: '' },
    initialSaleEndsAt: { type: Date, default: null, index: true },
    mode: { type: String, enum: ['initial_term', 'standard_sale', 'display_only'], default: 'initial_term' },
    decision: { type: String, enum: ['pending', 'continue_sale', 'display_only'], default: 'pending' },
    decisionAt: { type: Date, default: null },
    effectiveAt: { type: Date, default: null },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    recordedAs: { type: String, enum: ['artist', 'admin', 'system'], default: undefined },
    contactMethod: { type: String, enum: ['portal', 'phone', 'email', 'in_person', 'system'], default: undefined },
    note: { type: String, trim: true, default: '' },
    history: { type: [postTermHistorySchema], default: [] },
    notifications: {
        day30SentAt: { type: Date, default: null },
        day7SentAt: { type: Date, default: null },
        expiredSentAt: { type: Date, default: null }
    }
}, { _id: false });

const objsSchema = new Schema({
    image: { type: String, default: null },
    title: [{
        key: { type: String, default: null },
        value: { type: String, default: null },
    }],
    description: [{
        key: { type: String, default: null },
        value: { type: String, default: null },
    }],
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    technique: [{
        key: { type: String, default: null },
        value: { type: String, default: null }
    }],
    size: [{
        key: { type: String, default: null },
        value: { type: String, default: null }
    }],
    price: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: "69b917247aa08919285fb7ee" },
    status: {
        approval: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "69677d4de5f76f7a8c42dbf6" },
        sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "69678075e5f76f7a8c42dc12" },
    },
    submissionArtworkId: { type: mongoose.Schema.Types.ObjectId, default: null },
    postTermSale: { type: postTermSaleSchema, default: () => ({ applicable: false }) },
    artworkPiece: { type: String, default: null },
    artworkCode: { type: String, default: null },
    academicYear: { type: String, default: null, index: true },
    courseLevel: { type: String, default: '00', index: true },
    remark: [{
        key: { type: String, default: null },
        value: { type: String, default: null },
    }],
    rejectionReason: { type: String, default: null },
    views: { type: Number, default: 0 },
    storage: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Storage', default: null },
    storageDetail: { type: String, trim: true, default: '' }
}, { timestamps: true });

objsSchema.index(
    { artworkCode: 1 },
    { unique: true, partialFilterExpression: { artworkCode: { $type: 'string' } } }
);

module.exports = mongoose.model('Artwork', objsSchema, 'Artwork');
