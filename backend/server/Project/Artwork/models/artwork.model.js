const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    artworkPiece: { type: String, default: null },
    artworkCode: { type: String, default: null },
    remark: [{
        key: { type: String, default: null },
        value: { type: String, default: null },
    }],
    rejectionReason: { type: String, default: null },
    views: { type: Number, default: 0 },
    storage: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Storage', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Artwork', objsSchema, 'Artwork');
