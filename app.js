const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const users = {};

require('dotenv').config();
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./util/database")
const path =require("path")

//MODELS
const User = require("./model/userModel");
const Message = require("./model/chatModel");
const Groups = require("./model/groupModel");

//ROUTES
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoutes");

//Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "/views/")));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
})

//SOCKET.IO CONNECTION HANDLING
io.on('connection', socket => {
  socket.on('new-user-joined', (userName) => {
    console.log("NEW USER", userName)
    users[socket.id] = userName;

    io.emit('user-joined', userName);
  })

  socket.on('sendMessage', message => {
    socket.broadcast.emit('receivedMessage', {message: message, userName: users[socket.id]});
  });

  socket.on('disconnect', () => {
    const userName = users[socket.id];
    if(userName) {
      delete users[socket.id];
      socket.broadcast.emit('left', userName);
    }
  });
});

//REGISTERING ROUTES TO APP
app.use(userRoutes);
app.use(chatRoutes);
app.use(groupRoutes);


//ASSOCIATIONS
User.hasMany(Message);
Message.belongsTo(User);

User.hasMany(Groups);
Groups.belongsTo(User);


//SERVER
sequelize
  .sync()
  .then(() => {
    http.listen(process.env.PORT || 5000, () => {
      console.log("SERVER IS RUNNING ON PORT " + (process.env.PORT) || 5000);
    });
  })
  .catch((err) => {
    console.log(err);
  });