"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("sales_records_items", {
            _id: {
                type: Sequelize.UUID,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            product_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "products",
                    key: "_id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            stock_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "stock_audits",
                    key: "_id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            qty: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            loose_qty: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            mrp: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            amount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
            },
            sales_record_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "sales_records",
                    key: "_id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
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
        await queryInterface.dropTable("sales_records_items");
    },
};
