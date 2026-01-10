'use strict';

var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var objsSchema  = new Schema({
    number          : {type: Number, required: true},
    code            : {type: Number, required: true},
    message           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    status          : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "689c04cb255db4e56aea88ef" },
    create          : {
        by              : {type: mongoose.Schema.Types.ObjectId, ref: 'Information_Accounts'},
        datetime        : {type: Date, default: Date.now}
    },
});
module.exports = mongoose.model('Setting_Messages', objsSchema, 'Setting_Messages');
