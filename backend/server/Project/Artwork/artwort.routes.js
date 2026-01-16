const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const artworkService = require("./service/artwork");
const categoryService = require("./service/category");
const presentationService = require("./service/presentation")
const locationService = require("./service/location")

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

router.get("/presentation", presentationService.onQuerys);
router.post("/presentation", presentationService.onCreate);
router.put("/presentation", presentationService.onUpdate);
router.delete("/presentation", presentationService.onDelete);

router.get("/location", locationService.onQuerys);
router.post("/location", locationService.onCreate);
router.put("/location", locationService.onUpdate);
router.delete("/location", locationService.onDelete);

module.exports = router;