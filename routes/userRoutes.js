const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

router.post('/signup', userController.createNewUser);

router.post('/login', userController.postLogin);

router.get('/users', userController.getAllUsers);

module.exports = router;