const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const chatModel = sequelize.define('Message', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = chatModel;