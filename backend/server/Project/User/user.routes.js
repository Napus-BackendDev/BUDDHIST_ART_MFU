const express = require('express');
const router = express.Router();

const uploadImage = require('../../../middleware/uploadMiddleware');
const userService = require("./service/user");

router.get("", userService.onQuerys);
router.post("/explore", userService.onQuery);
router.post("/auth/sign-in", userService.onSignIn);
router.post("", userService.onCreate);
router.put("/upload", uploadImage("profile", "image"), userService.onUpload);
router.put("", userService.onUpdate);
router.delete("", userService.onDelete);

module.exports = router;