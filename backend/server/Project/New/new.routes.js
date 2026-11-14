const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const admin = require('../../../middleware/adminMiddleware');
const newService = require("./service/new");

router.post("/upload", admin.requirePermission("news", "edit"), uploadImage("news", "images", true, 10), newService.onUpload);
router.get("", newService.onQuerys);
router.get("/view/:id", newService.onUpdateView);
router.post("/explore", newService.onQuery);
router.post("", admin.requirePermission("news", "edit"), newService.onCreate);
router.put("", admin.requirePermission("news", "edit"), newService.onUpdate);
router.delete("", admin.requirePermission("news", "edit"), newService.onDelete);

module.exports = router;
