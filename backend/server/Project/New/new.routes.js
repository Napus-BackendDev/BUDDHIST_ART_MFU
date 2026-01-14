const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const newService = require("./service/new");

router.get("", newService.onQuerys);
router.post("/explore", newService.onQuery);
router.post("", newService.onCreate);
router.put("/upload", uploadImage("news", "image"), newService.onUpload);
router.put("", newService.onUpdate);
router.delete("", newService.onDelete);

module.exports = router;