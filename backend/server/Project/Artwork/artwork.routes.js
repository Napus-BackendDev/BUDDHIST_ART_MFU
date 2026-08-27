const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const auth = require('../../../middleware/authMiddleware');
const admin = require('../../../middleware/adminMiddleware');

const artworkService = require("./service/artwork");
const categoryService = require("./service/category");
const postTermSaleService = require("./service/postTermSale");
const adminSettings = require('../Settings/service/adminSettings');

router.get("", artworkService.onQuerys);
router.get("/post-term", auth, postTermSaleService.onList);
router.post("/post-term/decision", auth, postTermSaleService.onDecision);
router.get("/view/:id", artworkService.onUpdateView);
router.post("/explore", artworkService.onQuery);
router.post("", auth, artworkService.onCreate);
router.put("/upload", auth, uploadImage("artwork", "image"), artworkService.onUpload);
router.put("", auth, artworkService.onUpdate);
router.delete("", auth, artworkService.onDelete);

router.get("/category", categoryService.onQuerys);
router.get('/category/:id/impact', admin, (req, res) => { req.params.resource = 'category'; return adminSettings.impact(req, res); });
router.post("/category", admin, adminSettings.categoryCreate);
router.put("/category", admin, adminSettings.categoryUpdate);
router.delete("/category", admin, (req, res) => { req.params.resource = 'category'; return adminSettings.delete(req, res); });

module.exports = router;
