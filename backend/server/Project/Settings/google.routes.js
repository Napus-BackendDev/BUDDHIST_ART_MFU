const express = require('express');
const router = express.Router();
const googleService = require('../../../helpers/google/oAuth2');

// Google Authentication Route
router.post("/auth", googleService.onQuery);

module.exports = router;
