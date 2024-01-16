const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs').promises; 

//SIGNUP CONTROLLER
const createNewUser = async (req, res, next) => {

    try {
        const { name, email, phoneNumber, password } = req.body;
        // console.log("REQ BODY",req.body);
        console.log(req.file)

        const existingUser = await User.findOne({ where: { email: email } });

        if (existingUser) {
            return res.status(409).json({ error: 'USER ALREADY EXISTS' })
        }

        //Generate Salt -> to use for hashing
        const salt = await bcrypt.genSalt(10);

        //Hash the Password
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            password: hashedPassword,
            imageUrl: 'images/' + req.file.filename,
            isOnline: false,
        });

        res.status(201).json({ message: 'USER CREATED SUCCESSFULLY' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
    }
}

//GENERATE TOKEN
const generateAccessToken = (id, name) => {
    return jwt.sign({ userId: id, name: name }, process.env.TOKEN_SECRET)
}

// LOGIN CONTROLLER
const postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findAll({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user[0].password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "User not authorized" });
        }

        //UPDATE THE USER ONLINE STATUS
        await User.update({ isOnline: true }, { where: { email: email } });

        const token = generateAccessToken(user[0].id, user[0].name);

        return res.status(200).json({
            success: true,
            message: "User Logged in successfully",
            token: token,
            id: user[0].id,
            name: user[0].name
        });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET ALL USERS
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();

        // console.log("USERS", users);

        if (!users) {
            return res.status(404).json({ message: "Users not found" });
        }

        const userDetails = users.map(user => ({
            id: user.id,
            username: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            image: user.imageUrl,
            isOnline: user.isOnline,
        }));

        return res.status(200).json({ success: true, users: userDetails });
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

//UPDATE USER
const updateUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        // console.log(req.params);
        const imageUrl = req.file.path;

        const user = await User.findOne({ where: { id: userId } });

          // Delete the old image file if it exists
          if (user.imageUrl) {
            await fs.unlink(user.imageUrl);
            console.log("Old image deleted");
        }

        await user.update({ image: imageUrl });

        console.log("UPDATED IMAGE")

        const timestampedImageUrl = `${imageUrl}?timestamp=${new Date().getTime()}`;
        console.log(timestampedImageUrl);

        res.status(200).json({ 
            success: true, 
            message: 'Profile image updated successfully', 
            image: timestampedImageUrl, 
        });

    } catch (err) {
        console.error('Error updating profile image: ', err);
        res.status(500).json({ success: false, message: 'INTERNAL SERVER ERROR' });
    }
}

module.exports = {
    createNewUser,
    postLogin,
    getAllUsers,
    updateUser,
}