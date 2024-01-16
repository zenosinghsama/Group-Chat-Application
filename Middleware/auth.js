const jwt = require("jsonwebtoken");
const User = require('../model/userModel');

exports.authenticate = async (req, res, next) => {

  try {
    const authorizationHeaders = req.headers.authorization;

    if(!authorizationHeaders) {
      return res.status(401).json({ success: false, message: 'AUTHORIZATION HEADER MISSING'});
    }

    const token = authorizationHeaders.split('Bearer')[1].trim();

    if(!token) {
      return res.status(401).json({ success: false, message: "TOKEN NOT FOUND"});
    }

    const decodedToken = jwt.verify((token), process.env.TOKEN_SECRET);
    console.log('userId>>>>', decodedToken);

    const user = await User.findByPk(decodedToken.userId);
    
    req.user = user;
    next();
  } catch (err) {
    console.log("JWT ERROR", err);
    return res.status(401).json({ success: false, message: "login first" });
  }
};

