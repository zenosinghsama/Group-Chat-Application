const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const groupModel = sequelize.define("groups", {

    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    image: {
        type: Sequelize.STRING,
    },
    limit: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    
});

module.exports = groupModel;