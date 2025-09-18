import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";

class Organisation extends Model {}

Organisation.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        org_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        business_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        license_type: {
            type: DataTypes.ENUM("starter", "standard", "pro"),
            defaultValue: "starter",
        },
         organisation_id: {
            type: DataTypes.UUID,
            allowNull: true
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
        license_expiry: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        gst_number: DataTypes.STRING,
        pan_number: DataTypes.STRING,
        address: DataTypes.TEXT,
        city: DataTypes.STRING,
        state: DataTypes.STRING,
        pincode: DataTypes.STRING,
        currency: {
            type: DataTypes.STRING,
            defaultValue: "INR",
        },
        timezone: {
            type: DataTypes.STRING,
            defaultValue: "Asia/Kolkata",
        },
        logo_url: DataTypes.STRING,
        max_branches_allowed: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        max_sales_users: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        created_by_user_id: {
            type: DataTypes.UUID,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        owner_name: DataTypes.STRING,
        owner_email: DataTypes.STRING,
        owner_phone: DataTypes.STRING,
        owner_designation: DataTypes.STRING,
    },
    {
        sequelize,
        modelName: "Organisation",
        tableName: "organisations",
        timestamps: true,
        paranoid: true,
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
        },
    },
);

export const organisationFields = [
    "org_name",
    "business_type",
    "license_type",
    "license_expiry",
    "email",
    "phone",
    "gst_number",
    "pan_number",
    "address",
    "city",
    "state",
    "owner_name",
    "owner_email",
    "owner_phone",
    "owner_designation",
    "pincode",
    "currency",
    "timezone",
    "logo_url",
    "max_branches_allowed",
    "max_sales_users",
    "created_by_user_id",
    "status",
    "tenant_id",
];

export default Organisation;
