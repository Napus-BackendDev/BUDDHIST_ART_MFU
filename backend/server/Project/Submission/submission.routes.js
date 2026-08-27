const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');
const uploadExcel = require('../../../middleware/excelUploadMiddleware');

const auth = require('../../../middleware/authMiddleware');
const admin = require('../../../middleware/adminMiddleware');
const submissionService = require("./service/submission");

router.post("/import-excel", admin, (req, res, next) => {
    uploadExcel(req, res, err => {
        if (err) return res.status(400).json({ code: '40010', message: err.message });
        return next();
    });
}, submissionService.onImportExcel);
router.post("/upload", auth, uploadImage("submission", "image", false, 1), submissionService.onUpload);
router.get("", submissionService.onQuerys);
router.post("/explore", auth, submissionService.onQuery);
router.post("", auth, submissionService.onCreate);
router.put("", auth, submissionService.onUpdate);
router.delete("", auth, submissionService.onDelete);

module.exports = router;
