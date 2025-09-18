import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import Product from "./product.js";
import Branch from "./branches.js";
import StockAudit from "./stock_audit.js";

class BranchStockControl extends Model {}

BranchStockControl.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        invoice_id: {
            type: DataTypes.STRING,
            allowNull: false,
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
        product: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "products",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        branch_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "branchs",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        added_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        available_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        sell_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        available_loose_quantity: {
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
        rack_available_to_allocate: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        mrp: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        batch_no: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        mfg_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        expiry_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "BranchStockControl",
        tableName: "branch_stock",
        timestamps: true,
        paranoid: true,
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
        },
    },
);

BranchStockControl.belongsTo(Branch, {
    foreignKey: "branch_id",
    as: "Branch",
});
BranchStockControl.belongsTo(StockAudit, {
    foreignKey: "stock_audit_id",
    as: "StockAudit",
});

BranchStockControl.belongsTo(Product, {
    foreignKey: "product",
    as: "ProductItem",
});

export const branchStockControlFields = [
    "stock_audit_id",
    "branch_id",
    "product",
    "batch_no",
    "mfg_date",
    "rack_available_to_allocate",
    "sell_price",
    "mrp",
    "invoice_id",
    "expiry_date",
    "note",
    "available_loose_quantity",
    "added_quantity",
    "available_quantity",
    "organisation_id",
    "tenant_id",
];

export default BranchStockControl;
