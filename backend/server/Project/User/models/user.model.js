'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    studentId: { type: String, unique: true },
    image: { type: String, default: null },
    name: [{
        key: { type: String, default: null },
        value: { type: String, default: null },
    }],
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Role', default: null },
    bio: { type: String, default: null },
    contact: {
        telephone: { type: String, default: null },
        studentEmail: { type: String, unique: true, sparse: true },
        personalEmail: { type: String, default: null }
    },
    address: {
        bill: { type: String, default: null },
        shipping: { type: String, default: null },
    },
    password: { type: String, default: null, select: false },
    status: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', objsSchema, 'User');
