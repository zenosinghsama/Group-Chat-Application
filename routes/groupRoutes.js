const express = require("express");

const router = express.Router();

const authMiddleware = require("../Middleware/auth").authenticate;

const groupController = require("../controllers/groupController");

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'Images/')
    },
    filename: function(req, file, cb){
        console.log(file);
        let format = '';

        if (file.mimetype === 'image/jpeg') format = '.jpg';
        else if (file.mimetype === 'image/png') format = '.png';
        else if (file.mimetype === 'application/pdf') format = '.pdf';

        let fileName = file.originalname.split('.')[0] + '_' + Date.now() + format;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

router.post("/groups/create", upload.single("groupImage"), groupController.createGroup);

router.get("/groups/user",authMiddleware, groupController.getUserGroups);

router.post("/groups/members/add", authMiddleware,  groupController.addMember);

router.post("/groups/:groupId/add-users", groupController.addToExistingGroup);

router.post("/groups/:groupId/add-users-via-link", groupController.addViaLink);

router.get('/groups/:groupId/users', groupController.getGroupDetails);

router.post('/groups/:groupId/update-group', groupController.updateGroupDetails);

router.delete('/groups/:groupId/users/:userId', groupController.removeUsers);

module.exports = router;