const express = require('express')
const router = express.Router()
const uploadImage = require('../../../middleware/uploadMiddleware');

const orderService = require("./service/order")

router.get("", orderService.onQuerys);
router.post("/order", orderService.onQuerys);
router.post("", orderService.onCreate);
router.put("/upload", uploadImage("order", "image"), orderService.onUpload);
router.put("", orderService.onUpdate);
router.delete("", orderService.onDelete);
router.post("/generate-pdf", orderService.onGeneratePDF);

module.exports = router;