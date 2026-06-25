const express = require('express')
const router = express.Router()
const uploadImage = require('../../../middleware/uploadMiddleware');
const auth = require('../../../middleware/authMiddleware');

const orderService = require("./service/order")

router.get("/invoice/:id", auth, orderService.onDownloadInvoice);
router.get("/certificate/:id", auth, orderService.onDownloadCertificate);
router.get("", auth, orderService.onQuerys);
router.post("/order", auth, orderService.onQuerys);
router.post("", auth, orderService.onCreate);
router.put("/upload", auth, uploadImage("order", "image"), orderService.onUpload);
router.put("", auth, orderService.onUpdate);
router.delete("", auth, orderService.onDelete);

module.exports = router;