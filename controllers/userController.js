const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//SIGNUP CONTROLLER
const createNewUser = async(req, res, next) => {
    try {
        const { name, email, phoneNumber ,password } = req.body;

        const existingUser = await User.findOne({ where : { email: email } });
        if(existingUser) {
            return res.status(409).json({ error: 'Email already exists'})
        }

        //Generate Salt -> to use for hashing
        const salt = await bcrypt.genSalt(10);

        //Hash the Password
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User created successfully'});
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error'}); 
    }
}

module.exports = {
    createNewUser
}