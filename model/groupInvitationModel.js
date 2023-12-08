const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = require('./userModel');
const Group = require('./groupModel');

const GroupInvitation = sequelize.define('group_invitation', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  senderId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});


GroupInvitation.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
GroupInvitation.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

GroupInvitation.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });


module.exports = GroupInvitation;
