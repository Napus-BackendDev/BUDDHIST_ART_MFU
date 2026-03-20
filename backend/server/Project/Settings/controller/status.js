var mongo = require('mongodb');
var objSchema = require('../models/status.model');
const createBaseService = require('../../../../helpers/base.service');

const defaultPopulate = [
    { path: 'group' }
];
module.exports = createBaseService(objSchema, defaultPopulate);
