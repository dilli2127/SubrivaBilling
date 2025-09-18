"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("stock_outs", {
            _id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            stock_audit_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "stock_audits",
                    key: "_id",
                },
            },
            product_id: {
                type: Sequelize.UUID,
                allowNull: false,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            out_reason: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            out_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("stock_outs");
    },
};
