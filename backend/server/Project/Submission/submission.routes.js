const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');
const uploadExcel = require('../../../middleware/excelUploadMiddleware');

const auth = require('../../../middleware/authMiddleware');
const admin = require('../../../middleware/adminMiddleware');
const access = require('../../../middleware/submissionAccessMiddleware');
const work = require('./service/work');
const submissionService = require("./service/submission");
const { onImage } = require('./service/image');

router.get('/image/:artworkId', auth.optional, onImage);

router.post("/import-excel", admin, (req, res, next) => {
    uploadExcel(req, res, err => {
        if (err) return res.status(400).json({ code: '40010', message: err.message });
        return next();
    });
}, submissionService.onImportExcel);
router.post("/upload", auth, uploadImage("submission", "image", false, 1), submissionService.onUpload);
router.get("", auth.optional, submissionService.onQuerys);
router.post("/explore", auth, access.explore, submissionService.onQuery);
router.post("", admin, submissionService.onCreate);
router.put("", auth, (req,res,next)=>access.isAdmin(req) ? submissionService.onUpdate(req,res,next) : work.onUpdate(req,res,next));
router.delete("", admin, submissionService.onDelete);

module.exports = router;
