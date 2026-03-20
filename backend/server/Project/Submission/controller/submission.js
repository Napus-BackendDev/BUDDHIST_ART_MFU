var mongo = require('mongodb');
var objSchema = require('../models/submission.model');
const createBaseService = require('../../../../helpers/base.service')

const defaultPopulate = [
    { path: 'artist' },
    { path: 'assignments.artworks.owner' },
    { path: 'assignments.artworks.status' }
];
module.exports = createBaseService(objSchema, defaultPopulate);