const express = require("express");

const router = express.Router();

const authMiddleware = require("../Middleware/auth");

const groupController = require("../controllers/groupController");

router.get("/groups", groupController.loadGroups);

router.post("/groups", groupController.createNewGroup);

router.get("/groups/:groupId/join", groupController.joinGroupById)

module.exports = router;
