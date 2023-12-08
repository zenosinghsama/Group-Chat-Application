const express = require("express");

const router = express.Router();

const authMiddleware = require("../Middleware/auth").authenticate;

const groupController = require("../controllers/groupController");

router.post("/groups/create", groupController.createGroup);

router.get("/groups/user",authMiddleware, groupController.getUserGroups);

router.post("/groups/members/add", authMiddleware,  groupController.addMember);

module.exports = router;