const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/authMiddleware');
const admin = require('../../../middleware/adminMiddleware');

const message = require("./service/message");
const group = require("./service/group");
const status = require("./service/status");
const verification = require("./service/verification");
const role = require("./service/role");
const storage = require("./service/storage");
const adminSettings = require('./service/adminSettings');


router.get("/message", message.onQuerys);
router.post("/message", auth, message.onCreate);
router.put("/message", auth, message.onUpdate);
router.delete("/message", auth, message.onDelete);

router.get("/group", group.onQuerys);
router.get('/group/:id/impact', admin, (req, res) => { req.params.resource = 'group'; return adminSettings.impact(req, res); });
router.post("/group", admin, adminSettings.groupCreate);
router.put("/group", admin, adminSettings.groupUpdate);
router.delete("/group", admin, (req, res) => { req.params.resource = 'group'; return adminSettings.delete(req, res); });

router.get("/status", status.onQuerys);
router.get('/status/:id/impact', admin, (req, res) => { req.params.resource = 'status'; return adminSettings.impact(req, res); });
router.post("/status", admin, adminSettings.statusCreate);
router.put("/status", admin, adminSettings.statusUpdate);
router.delete("/status", admin, (req, res) => { req.params.resource = 'status'; return adminSettings.delete(req, res); });

router.get("/verification", verification.onQuerys);
router.post("/verification/explorers", auth, verification.onCreate);
router.post("/verification", auth, verification.onCreate);
router.put("/verification", auth, verification.onUpdate);
router.delete("/verification", auth, verification.onDelete);


router.get("/role", role.onQuerys);
router.post("/role/explore", role.onQuerys);
router.post("/role", auth, role.onCreate);
router.put("/role", auth, role.onUpdate);
router.delete("/role", auth, role.onDelete);

router.get("/storage", storage.onQuerys);
router.post("/storage", auth, storage.onCreate);
router.put("/storage", auth, storage.onUpdate);
router.delete("/storage", auth, storage.onDelete);


module.exports = router;
