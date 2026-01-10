'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    image           : {type: String, default: ""},
    contact         : {
        name            : {type: String, default: null},
        telephone       : {type: String, default: null},
        email           : {type: String, default: null},
    },
    address       : {
        bill            : {type: String, default: null},
        shipping        : {type: String, default: null},
    },
    artwork       : [{type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', default: null}],
    approvalStatus  : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "689c04cb255db4e56aea88ef" },
});

module.exports = mongoose.model('Order', objsSchema, 'Order');