"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      _id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      NIC: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      DLN: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "user",
      modelName: "User",
      timestamps: false,
    }
  );
  return User;
};
