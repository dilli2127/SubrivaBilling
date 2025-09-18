import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import SalesRecords from "./sales_record.js";

class InvoiceNumbers extends Model {}

InvoiceNumbers.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        prefix: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        last_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
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
        modelName: "InvoiceNumbers",
        tableName: "invoice_numbers",
        paranoid: true,
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt"],
            },
        },
    },
);

InvoiceNumbers.belongsTo(SalesRecords, {
    foreignKey: "stock_audit_id",
    as: "stock_audit_items",
});

export const InvoiceNumbersFields = [
    "prefix",
    "last_number",
    "organisation_id",
    "branch_id",
    "tenant_id",
];

export default InvoiceNumbers;
