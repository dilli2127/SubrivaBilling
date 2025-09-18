"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("organisations", {
            _id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("uuid_generate_v4()"),
                primaryKey: true,
            },
            org_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            business_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            license_type: {
                type: Sequelize.ENUM("starter", "standard", "pro"),
                defaultValue: "starter",
            },
            license_expiry: {
                type: Sequelize.DATE,
            },
            email: Sequelize.STRING,
            phone: Sequelize.STRING,
            gst_number: Sequelize.STRING,
            pan_number: Sequelize.STRING,
            address1: Sequelize.TEXT,
            address2: Sequelize.TEXT,
            address3: Sequelize.TEXT,
            city: Sequelize.STRING,
            state: Sequelize.STRING,
            pincode: Sequelize.STRING,
            currency: {
                type: Sequelize.STRING,
                defaultValue: "INR",
            },
            timezone: {
                type: Sequelize.STRING,
                defaultValue: "Asia/Kolkata",
            },
            logo_url: Sequelize.STRING,
            max_branches_allowed: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            },
            max_sales_users: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            },
            created_by_user_id: Sequelize.UUID,

            // ✅ Owner Details
            owner_name: Sequelize.STRING,
            owner_email: Sequelize.STRING,
            owner_phone: Sequelize.STRING,
            owner_designation: Sequelize.STRING,

            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "tenant_accounts",
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
        await queryInterface.dropTable("organisations");
    },
};
