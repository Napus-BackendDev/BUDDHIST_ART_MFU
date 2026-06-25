const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/authMiddleware');

const message = require("./service/message");
const group = require("./service/group");
const status = require("./service/status");
const verification = require("./service/verification");
const role = require("./service/role");
const storage = require("./service/storage");


router.get("/message", message.onQuerys);
router.post("/message", auth, message.onCreate);
router.put("/message", auth, message.onUpdate);
router.delete("/message", auth, message.onDelete);

router.get("/group", group.onQuerys);
router.post("/group", auth, group.onCreate);
router.put("/group", auth, group.onUpdate);
router.delete("/group", auth, group.onDelete);

router.get("/status", status.onQuerys);
router.post("/status", auth, status.onCreate);
router.put("/status", auth, status.onUpdate);
router.delete("/status", auth, status.onDelete);

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
