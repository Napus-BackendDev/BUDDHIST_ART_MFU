'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const { ADMIN_TABS, LEVELS } = require('../../../../helpers/rolePermissions');

const permissionsSchema = new Schema(
    Object.fromEntries(
        ADMIN_TABS.map(tab => [tab, { type: String, enum: LEVELS, default: 'none' }])
    ),
    { _id: false }
);

var objsSchema = new Schema({
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    description     : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    isSystem        : { type: Boolean, default: false },
    permissions     : { type: permissionsSchema, default: () => ({}) }
}, { timestamps: true });

module.exports = mongoose.model('Setting_Role', objsSchema, 'Setting_Role');
