import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import StockAudit from "./stock_audit.js";
import BranchStock from "./branch_stock.js";
import Rack from "./rack.js";

class StockStorage extends Model {}

StockStorage.init(
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
            onDelete: "CASCADE",
        },
        branch_stock_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "branch_stock",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        rack_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "racks",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        loose_quantity: {
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
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        branch_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "branchs",
                key: "_id",
            },
            onUpdate: "CASCADE",
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
        modelName: "StockStorage",
        tableName: "stock_storages",
        timestamps: true,
        paranoid: true,
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
        },
    },
);

StockStorage.belongsTo(StockAudit, {
    foreignKey: "stock_audit_id",
    targetKey: "_id",
    as: "StockAuditItem",
});
StockStorage.belongsTo(BranchStock, {
    foreignKey: "branch_stock_id",
    targetKey: "_id",
    as: "BranchStockItem",
});
StockStorage.belongsTo(Rack, {
    foreignKey: "rack_id",
    targetKey: "_id",
    as: "RackItem",
});

export const stockStorageFields = [
    "stock_audit_id",
    "branch_stock_id",
    "rack_id",
    "quantity",
    "loose_quantity",
    "occupied_percent",
    "organisation_id",
    "branch_id",
    "tenant_id",
];

export default StockStorage;
