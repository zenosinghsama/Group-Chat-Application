const express = require("express");

const router = express.Router();

const authMiddleware = require("../Middleware/auth").authenticate;

const groupMembers = require("../controllers/groupMemberController");

router.post("/group-member/join", authMiddleware, groupMembers.joinGroup);

router.delete("/group-member/leave", authMiddleware, groupMembers.leaveGroup);

module.exports = router;