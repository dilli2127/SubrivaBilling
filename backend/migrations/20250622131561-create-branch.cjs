"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("branches", {
            _id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("uuid_generate_v4()"),
                primaryKey: true,
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
            branch_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            branch_code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            phone: Sequelize.STRING,
            email: Sequelize.STRING,
            address1: Sequelize.TEXT,
            address2: Sequelize.TEXT,
            city: Sequelize.STRING,
            state: Sequelize.STRING,
            pincode: Sequelize.STRING,
            is_head_office: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
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
        await queryInterface.dropTable("branches");
    },
};
