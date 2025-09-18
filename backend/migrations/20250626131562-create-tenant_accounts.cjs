"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("tenant_accounts", {
            _id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("uuid_generate_v4()"),
                primaryKey: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            mobile: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            plan_type: {
                type: Sequelize.ENUM("starter", "standard", "pro"),
                defaultValue: "starter",
                allowNull: false,
            },
            max_organisations: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            },
            max_branches: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            },
            max_users: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            },
            address1: Sequelize.TEXT,
            address2: Sequelize.TEXT,
            city: Sequelize.STRING,
            state: Sequelize.STRING,
            pincode: Sequelize.STRING,
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
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
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("tenant_accounts");
    },
};
