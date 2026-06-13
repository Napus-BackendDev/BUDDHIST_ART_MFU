const express = require('express')
const router = express.Router()

const dashboardService = require("./service/dashboard")

router.get("/stats", dashboardService.onGetStats);

module.exports = router;
