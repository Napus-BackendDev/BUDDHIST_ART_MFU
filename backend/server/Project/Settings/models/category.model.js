'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    description     : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    create          : {
        datetime        : {type: Date, default: Date.now}
    },
});

module.exports = mongoose.model('Setting_Category', objsSchema, 'Setting_Category');
