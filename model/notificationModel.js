const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = require('./userModel');
const Group = require('./groupModel');
const Chat = require('./chatModel');
const GroupInvitation = require('./groupInvitationModel');
const groupMembers = require('./groupMembers');


const Notification = sequelize.define("notification", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    receiverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    status: {
        type: Sequelize.STRING,
    },
});

Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Notification.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

Notification.belongsTo(Group, { foreignKey: "groupId", as: 'group'});

Notification.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

Notification.belongsTo(GroupInvitation, { foreignKey: 'groupInvitationId', as: 'groupInvitation'});

Notification.belongsTo(groupMembers, { foreignKey: 'groupMemberId', as: 'groupMember'});

module.exports = Notification;