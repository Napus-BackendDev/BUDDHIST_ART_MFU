const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const admin = require('../../../middleware/adminMiddleware');
const newService = require("./service/new");

router.post("/upload", admin, uploadImage("news", "images", true, 10), newService.onUpload);
router.get("", newService.onQuerys);
router.get("/view/:id", newService.onUpdateView);
router.post("/explore", newService.onQuery);
router.post("", admin, newService.onCreate);
router.put("", admin, newService.onUpdate);
router.delete("", admin, newService.onDelete);

module.exports = router;
