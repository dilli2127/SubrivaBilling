"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("categories", {
      _id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      category_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hsn_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tax_percentage: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
       organisation_id: {
                  type: DataTypes.UUID,
                  allowNull: false,
                  references: {
                      model: "organisations",
                      key: "_id",
                  },
                  onDelete: "RESTRICT",
              },
              branch_id: {
                  type: DataTypes.UUID,
                  allowNull: true,
                  references: {
                      model: "branchs",
                      key: "_id",
                  },
                  onDelete: "RESTRICT",
              },
              tenant_id: {
                  type: DataTypes.UUID,
                  allowNull: false,
                  references: {
                      model: "tenant_accounts",
                      key: "_id",
                  },
                  onUpdate: "CASCADE",
                  onDelete: "RESTRICT",
              },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("categories");
  },
};
