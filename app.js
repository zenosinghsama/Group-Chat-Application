const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path")
const sequelize = require("./util/database");
const { handleSocketEvents } = require('./socketEvents');

const http = require('http');
const socketIo = require('socket.io');

//CREATE HTTP SERVER
const server = http.createServer(app);
const io = socketIo(server);

//Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/Images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, "/views/")));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
})

//ROUTES
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoutes");
const groupInvRoutes = require("./routes/groupInvitationRoutes");
const groupMemberRoutes = require("./routes/groupMemberRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

//REGISTERING ROUTES TO APP
app.use(userRoutes);
app.use(chatRoutes);
app.use(groupRoutes);
app.use(groupInvRoutes);
app.use(groupMemberRoutes);
app.use(notificationRoutes);

//MODELS
const User = require("./model/userModel");
const Chat = require("./model/chatModel");
const Group = require("./model/groupModel");
const GroupInv = require("./model/groupInvitationModel");
const GroupMember = require("./model/groupMembers");
const Notification = require("./model/notificationModel");
const { authenticate } = require("./Middleware/auth");

// Associations
User.hasMany(Chat);
Chat.belongsTo(User);

User.belongsToMany(Group, { through: GroupMember });
Group.belongsToMany(User, { through: GroupMember });

Group.hasMany(Chat);
Chat.belongsTo(Group);

Group.hasMany(GroupInv);
GroupInv.belongsTo(Group);

User.hasMany(Notification, { foreignKey: 'receiverId' });
Notification.belongsTo(User, { foreignKey: 'receiverId' });

//SOCKET IO CONNECTIONS
handleSocketEvents(io);

//SERVER
sequelize
  .sync()
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log("SERVER IS RUNNING ON PORT " + (process.env.PORT) || 5000);
    });
  })
  .catch((err) => {
    console.log(err);
  });