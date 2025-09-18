import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import SalesRecords from "./sales_record.js";
import StockAudit from "./stock_audit.js";

class StockOut extends Model {}

StockOut.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        stock_audit_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "stock_audits",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        out_reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        out_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        modelName: "StockOut",
        tableName: "stock_outs",
        paranoid: true,
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt"],
            },
        },
    },
);

StockOut.belongsTo(StockAudit, {
    foreignKey: "stock_audit_id",
    as: "stock_audit_items",
});

export const StockOutFields = [
    "stock_audit_id",
    "quantity",
    "out_reason",
    "out_date",
    "note",
    "organisation_id",
    "branch_id",
    "tenant_id",
];

export default StockOut;
