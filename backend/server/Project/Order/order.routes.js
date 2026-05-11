const express = require('express')
const router = express.Router()
const uploadImage = require('../../../middleware/uploadMiddleware');

const orderService = require("./service/order")

router.get("/invoice/:id", orderService.onDownloadInvoice);
router.get("/certificate/:id", orderService.onDownloadCertificate);
router.get("", orderService.onQuerys);
router.post("/order", orderService.onQuerys);
router.post("", orderService.onCreate);
router.put("/upload", uploadImage("order", "image"), orderService.onUpload);
router.put("", orderService.onUpdate);
router.delete("", orderService.onDelete);

module.exports = router;