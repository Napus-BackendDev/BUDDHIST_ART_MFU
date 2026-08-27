'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    code: { type: String, required: true, uppercase: true, trim: true, unique: true, immutable: true },
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    description     : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }]
}, { timestamps: true });

objsSchema.pre('validate', function (next) {
    if (!this.code) {
        const title = Array.isArray(this.title) && (this.title.find(item => item.key === 'en') || {}).value || 'CATEGORY';
        this.code = `CATEGORY_${String(title).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase().slice(0, 32)}_${String(this._id).slice(-6).toUpperCase()}`;
    }
    next();
});

module.exports = mongoose.model('Category', objsSchema, 'Category');
