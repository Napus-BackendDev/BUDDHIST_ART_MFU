var mongo = require('mongodb');
var objSchema = require('../models/artwork.model');
const createBaseService = require('../../../../helpers/base.service');

const defaultPopulate = [
    { path: 'artist' },
    { path: 'status.approval' },
    { path: 'status.sale' },
    { path: 'category' },
    { path: 'storage' }
];
module.exports = createBaseService(objSchema, defaultPopulate);