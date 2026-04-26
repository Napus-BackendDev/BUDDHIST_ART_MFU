const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const submissionService = require("./service/submission");

router.post("/upload", uploadImage("submission", "image", false, 1), submissionService.onUpload);
router.get("", submissionService.onQuerys);
router.post("/explore", submissionService.onQuery);
router.post("", submissionService.onCreate);
router.put("", submissionService.onUpdate);
router.delete("", submissionService.onDelete);

module.exports = router;