const express = require("express");

const router = express.Router();

const authMiddleware = require("../Middleware/auth").authenticate;

const notificationController = require("../controllers/notificationController");

router.get("/notifications/send", authMiddleware, notificationController.sendNotification);

router.post("/notifications/:userId", authMiddleware, notificationController.getNotification);

module.exports = router;