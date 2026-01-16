'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    code            : {type: String, default: null, unique: true},
    image           : {type: String, default: null},
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    owner           : {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    size            : {type: String, default: null},
    technique       : {type: mongoose.Schema.Types.ObjectId, ref: 'Technique', default: "689c04cb255db4e56aea88ef" },
    price           : {type: Number, default: 0},
    concept         : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    category        : {type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: "689c04cb255db4e56aea88ef" },
    presentation    : {type: mongoose.Schema.Types.ObjectId, ref: 'Presentation', default: "689c04cb255db4e56aea88ef" },
    status          : {
        approval        : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "69677d4de5f76f7a8c42dbf6" }, // Pending 
        sale            : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "69678075e5f76f7a8c42dc12" }, // Not for sale
    }, 
    location        : {type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: "689c04cb255db4e56aea88ef"},
    // สัดส่วนการจัดสรรผลงาน จำเป้นไหม ???
}, { timestamps: true });

module.exports = mongoose.model('Artwork', objsSchema, 'Artwork');
