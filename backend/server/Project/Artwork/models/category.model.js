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
    }]
}, { timestamps: true });

module.exports = mongoose.model('Category', objsSchema, 'Category');
