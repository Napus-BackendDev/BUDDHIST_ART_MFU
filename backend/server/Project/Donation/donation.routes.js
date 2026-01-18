const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const donationService = require("./service/donation");

router.get("", donationService.onQuerys);
router.post("/explore", donationService.onQuery);
router.post("", donationService.onCreate);
router.put("/upload", uploadImage("Donation", "image"), donationService.onUpload);
router.put("", donationService.onUpdate);
router.delete("", donationService.onDelete);

module.exports = router;