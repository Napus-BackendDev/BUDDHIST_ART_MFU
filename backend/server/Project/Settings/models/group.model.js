'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({

    code            : {type: String, required: true, unique: true, uppercase: true, trim: true, immutable: true},
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    description     : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    create          : {
        // by              : {type: mongoose.Schema.Types.ObjectId, ref: 'Information_Accounts'},
        datetime        : {type: Date, default: Date.now}
    },

});
objsSchema.pre('validate', function (next) {
    if (!this.code) {
        const title = Array.isArray(this.title) && (this.title.find(item => item.key === 'en') || {}).value || 'GROUP';
        this.code = `GROUP_${String(title).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase().slice(0, 32)}_${String(this._id).slice(-6).toUpperCase()}`;
    }
    next();
});
module.exports = mongoose.model('Setting_Group', objsSchema, 'Setting_Group');
