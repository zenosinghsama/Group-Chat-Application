const express = require("express");

const router = express.Router();

const authMiddleware = require("../Middleware/auth").authenticate;

const chatController = require("../controllers/chatController");

router.post("/chats/send", authMiddleware,  chatController.sendMessage);

// router.get("/chats/:userId/history",  chatController.getChatHistory);

router.get("/chats/groups/:groupId/history", chatController.getGroupChatHistory);

module.exports = router;