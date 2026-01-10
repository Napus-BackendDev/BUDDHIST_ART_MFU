const express = require('express');
const router = express.Router();

const artworkService = require("./service/artwork");

router.get("", artworkService.onQuerys);
router.post("/artwork", artworkService.onQuerys);
router.post("", artworkService.onCreate);
router.put("", artworkService.onUpdate);
router.delete("", artworkService.onDelete);

module.exports = router;