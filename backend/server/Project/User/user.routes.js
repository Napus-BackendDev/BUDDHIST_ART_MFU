const express = require('express');
const router = express.Router();

const uploadImage = require('../../../middleware/uploadMiddleware');
const auth = require('../../../middleware/authMiddleware');
const userService = require("./service/user");

router.get("", auth, userService.onQuerys);
router.post("/explore", userService.onQuery);
router.post("/explorers", userService.onQuery);
router.post("/auth/sign-in", userService.onSignIn);
router.post("/auth/dev-admin", userService.onDevAdminSignIn);
router.post("", auth, userService.onCreate);
router.put("/upload", auth, uploadImage("profile", "image"), userService.onUpload);
router.put("", auth, userService.onUpdate);
router.delete("", auth, userService.onDelete);

module.exports = router;
