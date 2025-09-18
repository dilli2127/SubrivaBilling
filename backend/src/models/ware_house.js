import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Warehouse extends Model {}

Warehouse.init(
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    warehouse_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    warehouse_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    email: {
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
    modelName: "Warehouse",
    tableName: "warehouses",
    timestamps: true,
    paranoid: true, // adds deletedAt for soft delete
    defaultScope: {
      attributes: {
        exclude: ["createdAt", "updatedAt", "deletedAt"],
      },
    },
  }
);

export const warehouseFields = [
  "warehouse_name",
  "warehouse_code",
  "phone",
  "email",
  "address",
  "city",
  "state",
  "pincode",
  "status",
  "organisation_id",
  "branch_id",
  "tenant_id",
];

export default Warehouse;
