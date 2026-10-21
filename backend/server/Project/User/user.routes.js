const express = require('express');
const router = express.Router();

const uploadImage = require('../../../middleware/uploadMiddleware');
const auth = require('../../../middleware/authMiddleware');
const admin = require('../../../middleware/adminMiddleware');
const { ownProfile } = require('../../../middleware/userAccessMiddleware');
const userService = require("./service/user");

router.get("", auth, userService.onQuerys);
router.post("/explore", auth.optional, userService.onQuery);
router.post("/explorers", auth.optional, userService.onQuery);
router.post("", admin, userService.onCreate);
router.put("/upload", auth, uploadImage("profile", "image"), userService.onUpload);
router.put("", auth, ownProfile, userService.onUpdate);
router.delete("", admin, userService.onDelete);

module.exports = router;
