const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const newService = require("./service/new");

router.get("", newService.onQuerys);
router.post("/new", newService.onQuerys);
router.post("", newService.onCreate);
router.put("/upload/new", uploadImage("news", "image"), newService.onUpload);
router.put("", newService.onUpdate);
router.delete("", newService.onDelete);

module.exports = router;