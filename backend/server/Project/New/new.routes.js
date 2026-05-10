const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const auth = require('../../../middleware/authMiddleware');
const newService = require("./service/new");

router.post("/upload", auth, uploadImage("news", "images", true, 10), newService.onUpload);
router.get("", newService.onQuerys);
router.get("/view/:id", newService.onUpdateView);
router.post("/explore", newService.onQuery);
router.post("", auth, newService.onCreate);
router.put("", auth, newService.onUpdate);
router.delete("", auth, newService.onDelete);

module.exports = router;