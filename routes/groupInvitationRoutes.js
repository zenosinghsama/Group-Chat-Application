const express = require("express");

const router = express.Router();

const authMiddleware = require("../Middleware/auth").authenticate;

const groupInVController = require("../controllers/groupInvController");

router.get("/group-inv/send", authMiddleware, groupInVController.sendInvitation);

router.post("/group-inv/:invId/accept", authMiddleware, groupInVController.acceptInvitation);

module.exports = router;