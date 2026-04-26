const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const artworkService = require("./service/artwork");
const categoryService = require("./service/category");

router.get("", artworkService.onQuerys);
router.post("/explore", artworkService.onQuery);
router.post("", artworkService.onCreate);
router.put("/upload", uploadImage("artwork", "image"), artworkService.onUpload);
router.put("", artworkService.onUpdate);
router.delete("", artworkService.onDelete);

router.get("/category", categoryService.onQuerys);
router.post("/category", categoryService.onCreate);
router.put("/category", categoryService.onUpdate);
router.delete("/category", categoryService.onDelete); 

module.exports = router;