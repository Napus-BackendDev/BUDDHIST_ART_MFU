const express = require('express');
const router = express.Router();

const message = require("./service/message");
const group = require("./service/group");
const status = require("./service/status");
const verification = require("./service/verification");
const role = require("./service/role");
// const auth_message = require("./service/auth_message");
// const Role = require("../Accounts/service/role");
// const Authen_Type = require("../Accounts/service/authen_type");


router.get("/message", message.onQuerys);
router.post("/message", message.onCreate);
router.put("/message", message.onUpdate);
router.delete("/message", message.onDelete);

router.get("/group", group.onQuerys);
router.post("/group", group.onCreate);
router.put("/group", group.onUpdate);
router.delete("/group", group.onDelete);

router.get("/status", status.onQuerys);
router.post("/status", status.onCreate);
router.put("/status", status.onUpdate);
router.delete("/status", status.onDelete);

// router.get("/levels", level.onQuerys);
// router.post("/levels/explorers", level.onCreate);
// router.post("/levels", level.onCreate);
// router.put("/levels", level.onUpdate);
// router.delete("/levels", level.onDelete);

router.get("/verification", verification.onQuerys);
router.post("/verification/explorers", verification.onCreate);
router.post("/verification", verification.onCreate);
router.put("/verification", verification.onUpdate);
router.delete("/verification", verification.onDelete);


// authen service

// router.get("/auth/message", auth_message.onQuerys);
// router.post("/auth/message/explorers", auth_message.onCreate);
// router.post("/auth/message", auth_message.onCreate);
// router.put("/auth/message", auth_message.onUpdate);
// router.delete("/auth/message", auth_message.onDelete);


router.get("/role", role.onQuerys);
router.post("/role/explore", role.onQuerys);
router.post("/role", role.onCreate);
router.put("/role", role.onUpdate);
router.delete("/role", role.onDelete);

// router.get("/authen/type", Authen_Type.onQuerys);
// router.post("/authen/type", Authen_Type.onCreate);
// router.put("/authen/type", Authen_Type.onUpdate);
// router.delete("/authen/type", Authen_Type.onDelete);


module.exports = router;
