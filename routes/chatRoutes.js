const express = require("express");

const router = express.Router();

const authMiddleware = require("../Middleware/auth");

const chatController = require("../controllers/chatController");

router.get("/messages", authMiddleware.authenticateToken, chatController.getMessages);

router.post("/sendMessage", authMiddleware.authenticateToken, chatController.addNewMessage);

module.exports = router;