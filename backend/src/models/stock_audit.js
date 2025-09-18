import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import Product from "./product.js";
import Vendor from "./vendor.js";
import Warehouse from "./ware_house.js";

class StockAudit extends Model {}

StockAudit.init(
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
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rack_available_to_allocate: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
         available_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        buy_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        mrp: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        available_loose_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        total_cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        sell_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
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
        vendor: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "vendors",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        buyed_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        payment_status: {
            type: DataTypes.ENUM("paid", "pending", "partial"),
            allowNull: false,
        },
        warehouse_location: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "warehouses",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
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
        modelName: "StockAudit",
        tableName: "stock_audits",
        timestamps: true,
        paranoid: true,
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
        },
    },
);
StockAudit.belongsTo(Product, {
    foreignKey: "product",
    as: "ProductItem",
});

StockAudit.belongsTo(Vendor, {
    foreignKey: "vendor",
    as: "VendorDetails",
});

StockAudit.belongsTo(Warehouse, {
    foreignKey: "location",
    as: "WarehouseLocation",
});

export const stockAuditFields = [
    "invoice_id",
    "product",
    "quantity",
    "buy_price",
    "total_cost",
    "sell_price",
    "rack_available_to_allocate",
    "batch_no",
    "mfg_date",
    "mrp",
    "expiry_date",
    "vendor",
    "buyed_date",
    "payment_status",
    "stock_type",
    "out_reason",
    "location",
    "note",
    "available_quantity",
    "available_loose_quantity",
    "organisation_id",
    "branch_id",
    "tenant_id",
];

export default StockAudit;
