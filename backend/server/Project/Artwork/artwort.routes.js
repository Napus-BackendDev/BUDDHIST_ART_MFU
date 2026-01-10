const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const artworkService = require("./service/artwork");

router.get("", artworkService.onQuerys);
router.post("/artwork", artworkService.onQuerys);
router.post("", uploadImage("artwork", "image"), artworkService.onCreate);
router.put("", uploadImage("artwork", "image"), artworkService.onUpdate);
router.delete("", artworkService.onDelete);

module.exports = router;