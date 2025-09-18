import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import Product from "./product.js";
import SalesRecords from "./sales_record.js";
import StockAudit from "./stock_audit.js";

class SalesRecordItems extends Model {}

SalesRecordItems.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "products",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        stock_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "stock_audits",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        branch_stock_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "branch_stock",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        qty: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        loose_qty: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        mrp: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        sales_record_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "sales_records",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
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
        modelName: "SalesRecordItems",
        tableName: "sales_records_items",
        paranoid: true,
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt"],
            },
        },
    },
);

SalesRecordItems.belongsTo(Product, {
    foreignKey: "product_id",
    as: "productItems",
});

SalesRecordItems.belongsTo(StockAudit, {
    foreignKey: "stock_id",
    as: "stockAuditItems",
});

export const salesRecordItemsFields = [
    "sales_record_id",
    "product_id",
    "stock_id",
    "qty",
    "mrp",
    "loose_qty",
    "price",
    "branch_stock_id",
    "amount",
    "organisation_id",
    "branch_id",
    "tenant_id",
];

export default SalesRecordItems;
