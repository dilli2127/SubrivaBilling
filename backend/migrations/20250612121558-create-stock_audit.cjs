"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("stock_audits", {
            _id: {
                type: Sequelize.UUID,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            invoice_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            product: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "products",
                    key: "_id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            available_quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            available_loose_quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            buy_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            total_cost: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            sell_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            mrp: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            batch_no: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            mfg_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            expiry_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            vendor: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "vendors",
                    key: "_id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            buyed_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            payment_status: {
                type: Sequelize.ENUM("paid", "pending", "partial"),
                allowNull: false,
            },
            location: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "warehouses",
                    key: "_id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            note: {
                type: Sequelize.TEXT,
                allowNull: true,
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
        await queryInterface.dropTable("stock_audits");
    },
};
