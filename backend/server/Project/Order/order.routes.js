const express = require('express')
const router = express.Router()

const orderService = require("./service/order")

router.get("", orderService.onQuerys);
router.post("/order", orderService.onQuerys);
router.post("", orderService.onCreate);
router.put("", orderService.onUpdate);
router.delete("", orderService.onDelete);

module.exports = router;