'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    images          : [{type: String, default: null}],
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    description     : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    views           : {type: Number, default: 0},
    create          : {
        datetime        : {type: Date, default: Date.now},
        updatedAt       : {type: Date, default: Date.now},
    },
});

module.exports = mongoose.model('New', objsSchema, 'New');
