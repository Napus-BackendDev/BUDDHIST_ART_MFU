const express = require('express');
const router = express.Router();
const uploadImage = require('../../../middleware/uploadMiddleware');

const auth = require('../../../middleware/authMiddleware');
const admin = require('../../../middleware/adminMiddleware');
const access = require('../../../middleware/artworkAccessMiddleware');

const artworkService = require("./service/artwork");
const categoryService = require("./service/category");
const postTermSaleService = require("./service/postTermSale");
const adminSettings = require('../Settings/service/adminSettings');

router.get("", auth.optional, artworkService.onQuerys);
router.get("/post-term", auth, postTermSaleService.onList);
router.post("/post-term/decision", auth, postTermSaleService.onDecision);
router.get("/view/:id", auth.optional, artworkService.onUpdateView);
router.post("/explore", auth.optional, artworkService.onQuery);
router.post("", auth, access.create, artworkService.onCreate);
router.put("/upload", auth, uploadImage("artwork", "image"), artworkService.onUpload);
router.put("", auth, access.update, artworkService.onUpdate);
router.delete("", auth, access.remove, artworkService.onDelete);

router.get("/category", categoryService.onQuerys);
router.get('/category/:id/impact', admin.requirePermission("settings", "view"), (req, res) => { req.params.resource = 'category'; return adminSettings.impact(req, res); });
router.post("/category", admin.requirePermission("settings", "edit"), adminSettings.categoryCreate);
router.put("/category", admin.requirePermission("settings", "edit"), adminSettings.categoryUpdate);
router.delete("/category", admin.requirePermission("settings", "edit"), (req, res) => { req.params.resource = 'category'; return adminSettings.delete(req, res); });

module.exports = router;
