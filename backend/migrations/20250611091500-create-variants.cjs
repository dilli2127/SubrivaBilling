"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("variants", {
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            variant_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            unit: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            category: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            pack_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            pack_size: {
                type: Sequelize.STRING,
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
        await queryInterface.dropTable("variants");
    },
};
