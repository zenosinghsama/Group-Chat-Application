const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const Group = require('./groupModel');
const User = require('./userModel');

const GroupMember = sequelize.define('GroupMember', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
});

GroupMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = GroupMember;