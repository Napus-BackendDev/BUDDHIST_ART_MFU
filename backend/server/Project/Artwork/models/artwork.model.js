'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    code            : {type: String, default: null, unique: true, required: true},
    image           : {type: String, default: ""},
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    create          : {
        by              : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        datetime        : {type: Date, default: Date.now},
        updatedAt       : {type: Date, default: Date.now},
    },
    size            : {type: String, default: null},
    technique       : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_technique', default: "689c04cb255db4e56aea88ef" },
    price           : {type: Number, default: 0},
    concept         : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    category        : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_category', default: "689c04cb255db4e56aea88ef" },
    presentation    : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_presentation', default: "689c04cb255db4e56aea88ef" },
    approvalStatus  : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "689c04cb255db4e56aea88ef" },
    saleStatus      : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "689c04cb255db4e56aea88ef" },
});

module.exports = mongoose.model('Artwork', objsSchema, 'Artwork');
