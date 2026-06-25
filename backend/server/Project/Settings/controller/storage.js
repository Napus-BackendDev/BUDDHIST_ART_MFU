'use strict';

var objSchema = require('../models/storage.model');
const createBaseService = require('../../../../helpers/base.service');

const defaultPopulate = [
];

module.exports = createBaseService(objSchema, defaultPopulate);
