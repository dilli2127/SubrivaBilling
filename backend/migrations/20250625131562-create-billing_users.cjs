"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("billing_users", {
            _id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("uuid_generate_v4()"),
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            organisation_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "organisations",
                    key: "_id",
                },
                onDelete: "CASCADE",
            },
            branch_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "branches",
                    key: "_id",
                },
                onDelete: "CASCADE",
            },
            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            user_name: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            mobile: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            role_id: {
                type: Sequelize.UUID,
                references: {
                    model: "roles",
                    key: "_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("billing_users");
    },
};
