const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const artworkService = require("./service/artwork");

router.get("", artworkService.onQuerys);
router.post("/explore", artworkService.onQuerys);
router.post("", artworkService.onCreate);
router.put("/upload", uploadImage("artwork", "image"), artworkService.onUpload);
router.put("", artworkService.onUpdate);
router.delete("", artworkService.onDelete);

module.exports = router;