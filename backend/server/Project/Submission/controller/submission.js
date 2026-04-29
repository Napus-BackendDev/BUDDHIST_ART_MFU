var mongo = require('mongodb');
var objSchema = require('../models/submission.model');
const createBaseService = require('../../../../helpers/base.service')

const defaultPopulate = [
    { path: 'artist' },
    { 
        path: 'assignments',
        populate: {
            path: 'artworks',
            populate: [
                { path: 'owner' },
                { path: 'status' },
                { path: 'category' }
            ]
        }
    }
];
module.exports = createBaseService(objSchema, defaultPopulate);