const express = require('express')
const router = express.Router()
const uploadImage = require('../../../middleware/uploadMiddleware');
const auth = require('../../../middleware/authMiddleware');
const admin = require('../../../middleware/adminMiddleware');
const access = require('../../../middleware/orderAccessMiddleware');

const orderService = require("./service/order")

router.get("/invoice/:id", auth, access.read, orderService.onDownloadInvoice);
router.get("/certificate/:id", auth, access.read, orderService.onDownloadCertificate);
router.get("", auth, access.scopeList, orderService.onQuerys);
router.post("/order", auth, access.scopeList, orderService.onQuerys);
router.post("", auth, access.create, orderService.onCreate);
router.put("/upload", auth, uploadImage("order", "image"), orderService.onUpload);
router.put("/replace-slip", admin.requirePermission("orders", "edit"), uploadImage("order", "image", false, 10, access.authorizeReplaceSlip), orderService.onReplaceSlip);
router.put("", auth, access.update, orderService.onUpdate);
router.delete("", admin.requirePermission("orders", "edit"), orderService.onDelete);

module.exports = router;
