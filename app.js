const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./util/database")
const path =require("path")

//MODELS
const User = require("./model/userModel");
const Message = require("./model/chatModel");

//ROUTES
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");

//Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "/views/")));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
})

//REGISTERING ROUTES TO APP
app.use(userRoutes);
app.use(chatRoutes);


//ASSOCIATIONS
User.hasMany(Message);
Message.belongsTo(User);


//SERVER
sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });