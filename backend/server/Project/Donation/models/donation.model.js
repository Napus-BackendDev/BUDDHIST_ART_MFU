'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    // image           : {type: String, default: ""},
    // title           : [{
    //     key            : {type: String, default: null},
    //     value          : {type: String, default: null},
    // }],
    // description     : [{
    //     key            : {type: String, default: null},
    //     value          : {type: String, default: null},
    // }],
    // create          : {
    //     // by              : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    //     datetime        : {type: Date, default: Date.now},
    //     updatedAt       : {type: Date, default: Date.now},
    // },
});

module.exports = mongoose.model('Donation', objsSchema, 'Donation');
