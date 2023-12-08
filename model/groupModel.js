const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const User = require("./userModel");
const GroupMember = require("./groupMembers");

const Group = sequelize.define("group", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    adminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    groupName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

Group.belongsTo(User, { foreignKey: 'adminId', as:'admin' });
User.hasMany(Group,{foreignKey: "id"})

Group.hasMany(GroupMember, { foreignKey: 'groupId', as: 'members' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId', as: 'group' })


module.exports = Group;