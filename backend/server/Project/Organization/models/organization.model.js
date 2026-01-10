'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    code            : {type: String, default: null, unique: true, required: true},
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    description     : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    tax             : {type: String, default: null},
    branch          : {type: String, default: null},
    contact         : {
        telephone       : {type: String, default: null},
        email           : {type: String, default: null},
        line            : {type: String, default: null},
    },
    location        : {
        lat             : {type: String, default: null},
        long            : {type: String, default: null},
    },
    status          : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "689c04cb255db4e56aea88ef" },
    create          : {
        by              : {type: mongoose.Schema.Types.ObjectId, ref: 'Information_Accounts'},
        datetime        : {type: Date, default: Date.now}
    },
    isDeleted       : { type: Boolean, default: false }
});

module.exports = mongoose.model('Organization', objsSchema, 'Organization');
