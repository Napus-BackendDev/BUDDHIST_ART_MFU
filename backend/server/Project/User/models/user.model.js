'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    studentId       : {type: String, unique: true, required: true},
    image           : {type: String, default: null},
    name           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    contact         : {
        telephone       : {type: String, default: null},
        studentEmail    : {type: String, default: null , required: true, unique: true},
        personalEmail   : {type: String, default: null}
    }
});

module.exports = mongoose.model('User', objsSchema, 'User');
