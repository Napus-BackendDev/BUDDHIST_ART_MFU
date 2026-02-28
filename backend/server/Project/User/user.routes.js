const express = require('express');
const router = express.Router();

const userService = require("./service/user");

router.get("", userService.onQuerys);
router.post("/explore", userService.onQuery);
router.post("", userService.onCreate);
router.put("", userService.onUpdate);
router.delete("", userService.onDelete);

module.exports = router;