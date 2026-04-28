'use strict';

const express = require('express');
const router = express.Router();
const googleHelper = require('../../../helpers/google/oAuth2');

// Google Authentication
// POST /api/v1/google/auth
router.post('/auth', googleHelper.onQuery);

// Google Maps Distance Matrix
// POST /api/v1/google/distance
router.post('/distance', googleHelper.onDistance);

module.exports = router;
