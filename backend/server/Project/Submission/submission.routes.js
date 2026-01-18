const express = require('express');
const router = express.Router();

const submissionService = require("./service/submission");

router.get("", submissionService.onQuerys);
router.post("/explore", submissionService.onQuery);
router.post("", submissionService.onCreate);
router.put("", submissionService.onUpdate);
router.delete("", submissionService.onDelete);

module.exports = router;