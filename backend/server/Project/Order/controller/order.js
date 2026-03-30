var mongo = require('mongodb');
var objSchema = require('../models/order.model');
const createBaseService = require('../../../../helpers/base.service');

const defaultPopulate = [
    { 
        path: 'artwork', 
        populate: [
            { path: 'artist' },
            { path: 'category' }
        ] 
    },
    { path: 'status' }
];
module.exports = createBaseService(objSchema, defaultPopulate);