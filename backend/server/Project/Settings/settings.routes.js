const express = require('express');
const router = express.Router();

const message = require("./service/message");
const status = require("./service/status");
const verification = require("./service/verification");
// const auth_message = require("./service/auth_message");
// const Role = require("../Accounts/service/role");
// const Authen_Type = require("../Accounts/service/authen_type");


router.get("/message", message.onQuerys);
router.post("/message", message.onCreate);
router.put("/message", message.onUpdate);
router.delete("/message", message.onDelete);

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

// router.get("/role", Role.onQuerys);
// router.post("/role", Role.onCreate);
// router.put("/role", Role.onUpdate);
// router.delete("/role", Role.onDelete);

// router.get("/authen/type", Authen_Type.onQuerys);
// router.post("/authen/type", Authen_Type.onCreate);
// router.put("/authen/type", Authen_Type.onUpdate);
// router.delete("/authen/type", Authen_Type.onDelete);


module.exports = router;
