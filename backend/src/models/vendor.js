import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";

class Vendor extends Model {}

Vendor.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        vendor_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        company_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contact_person: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        gst_no: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pan_no: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pincode: {
            type: DataTypes.STRING(6),
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
    },
    {
        sequelize,
        modelName: "Vendor",
        tableName: "vendors",
        timestamps: true, // enables createdAt and updatedAt
        paranoid: true, // enables deletedAt (soft delete)
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
        },
    },
);

export const vendorFields = [
    "vendor_name",
    "company_name",
    "contact_person",
    "phone",
    "email",
    "gst_no",
    "pan_no",
    "address",
    "city",
    "state",
    "pincode",
    "status",
    "organisation_id",
    "branch_id",
    "tenant_id",
];
export default Vendor;
