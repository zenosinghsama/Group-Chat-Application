const express = require('express');
const path = require('path');
const router = express.Router();

const userController = require('../controllers/userController');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'Images/')
    },
    filename: function (req, file, cb) {
        console.log(file);
        let format = '';

        if      ( file.mimetype === 'image/jpeg' )      format = '.jpg';
        else if ( file.mimetype === 'image/png' )       format = '.png';
        else if ( file.mimetype === 'application/pdf' ) format = '.pdf';

        let fileName = file.originalname.split('.')[0] + '_' + Date.now() + format;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

router.post('/signup', upload.single("profileImage"), userController.createNewUser);

router.post('/login', userController.postLogin);

router.get('/users', userController.getAllUsers);

router.post('/users/edit-user/:userId', upload.single("profileImage"), userController.updateUser);

module.exports = router;