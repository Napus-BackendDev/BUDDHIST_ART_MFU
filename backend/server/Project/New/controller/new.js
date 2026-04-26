var mongo = require('mongodb');
var objSchema = require('../models/new.model');
const createBaseService = require('../../../../helpers/base.service');

const defaultPopulate = [
    { path: 'category' }
];
module.exports = createBaseService(objSchema, defaultPopulate);