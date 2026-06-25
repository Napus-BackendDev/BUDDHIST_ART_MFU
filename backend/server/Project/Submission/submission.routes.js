const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const auth = require('../../../middleware/authMiddleware');
const submissionService = require("./service/submission");

router.post("/upload", auth, uploadImage("submission", "image", false, 1), submissionService.onUpload);
router.get("", submissionService.onQuerys);
router.post("/explore", auth, submissionService.onQuery);
router.post("", auth, submissionService.onCreate);
router.put("", auth, submissionService.onUpdate);
router.delete("", auth, submissionService.onDelete);

module.exports = router;