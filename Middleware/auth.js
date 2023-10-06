const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

exports.authenticateToken = (req, res, next) => {

  try {
    const token = req.header('Authorization');
    console.log(token);

    const user = jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if(err) {
        console.log('JWT VERIFICATION ERROR: ', err.message);
        return res.status(401).json({ success: false, message: 'AUTHENTICATION FAILED'});
      }
      console.log('userID is: ', decoded.userId);
      return decoded;
    });

    console.log('userID>>>>', user.userId)

    User.findByPk(user.userId)
    .then(user => {

      req.user = user;
      next();
      console.log(token,"VERIFIED TOKEN");
    })
    } 
  catch (err) {
    console.log("catch", err)
    res.status(401).json({ success: false, message:'AUTHENTICATION FAILED'})
  }
};