import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";

class TenantAccount extends Model {}

TenantAccount.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        plan_type: {
            type: DataTypes.ENUM("starter", "standard", "pro"),
            defaultValue: "starter",
            allowNull: false,
        },
        user_role: {
            type: DataTypes.ENUM("tenant", "admin", "user"),
            defaultValue: "tenant",
            allowNull: true,
        },
        max_organisations: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        max_branches: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        max_users: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        license_start: {
            type: DataTypes.DATE,
        },
        license_expiry: {
            type: DataTypes.DATE,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        address1: DataTypes.TEXT,
        address2: DataTypes.TEXT,
        city: DataTypes.STRING,
        state: DataTypes.STRING,
        pincode: DataTypes.STRING,
    },
    {
        sequelize,
        modelName: "TenantAccount",
        tableName: "tenant_accounts",
        timestamps: true,
        paranoid: true,
        defaultScope: {
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt"],
            },
        },
    },
);

export const tenantAccountFields = [
    "email",
    "mobile",
    "password",
    "plan_type",
    "max_organisations",
    "max_branches",
    "max_users",
    "address1",
    "address2",
    "city",
    "state",
    "pincode",
    "status",
    "license_start",
    "license_expiry",
    "name",
    "user_role"
];

export default TenantAccount;
