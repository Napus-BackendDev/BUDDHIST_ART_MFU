const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const newService = require("./service/new");

router.post("/upload", uploadImage("news", "images", true, 10), newService.onUpload);
router.get("", newService.onQuerys);
router.get("/view/:id", newService.onUpdateView);
router.post("/explore", newService.onQuery);
router.post("", newService.onCreate);
router.put("", newService.onUpdate);
router.delete("", newService.onDelete);

module.exports = router;