const express = require('express');
const router = express.Router();

const newService = require("./service/new");

router.get("", newService.onQuerys);
router.post("/new", newService.onQuerys);
router.post("", newService.onCreate);
router.put("", newService.onUpdate);
router.delete("", newService.onDelete);

module.exports = router;