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
            return res.status(409).json({ error: 'USER ALREADY EXISTS'})
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

        res.status(201).json({ message: 'USER CREATED SUCCESSFULLY'});
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: 'INTERNAL SERVER ERROR'}); 
    }
}


//GENERATE TOKEN
const generateAccessToken = (id, name) => {
    return jwt.sign({ userId : id, name: name }, process.env.TOKEN_SECRET)
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
        
            if(!isPasswordValid) {
                return res.status(401).json({ message: "User not authorized" });
            }
                const token = generateAccessToken(user[0].id, user[0].name);

                    return res.status(200).json({ 
                    success: true,
                    message:"User Logged in successfully",
                    token: token,
                    id: user[0].id,
                    name: user[0].name
                });
                
    } catch(error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createNewUser,
    postLogin
}