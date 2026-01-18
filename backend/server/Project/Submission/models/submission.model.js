'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    image           : {type: String, default: null},
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    description     : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    maxRound        : { type: Number, default: 5, min: 1 },
    controll        : [{
        key            : [{
            key           : {type: String, default: null},
            value         : {type: String, default: null}
        }],
        value          : [{type: mongoose.Schema.Types.ObjectId, ref: "Homework"}],
    }],
});

module.exports = mongoose.model('Submission', objsSchema, 'Submission');
