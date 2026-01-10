var mongo = require('mongodb');
var objSchema = require('../models/artwork.model');
const createBaseService = require('../../../../helpers/base.service');

const defaultPopulate = [
];
module.exports = createBaseService(objSchema, defaultPopulate);