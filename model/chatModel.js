const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Chat = sequelize.define('chat', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    }, 
    senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    receiverId: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

module.exports = Chat;