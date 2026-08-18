const mongoose = require('mongoose');

const artworkCounterSchema = new mongoose.Schema({
    scope: { type: String, required: true, unique: true, index: true },
    sequence: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ArtworkCounter', artworkCounterSchema, 'ArtworkCounter');
