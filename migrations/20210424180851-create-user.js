"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user", {
      _id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      NIC: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      DLN: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("user");
  },
};
