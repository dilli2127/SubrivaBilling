import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";

class Variant extends Model {}

Variant.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        variant_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pack_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pack_size: {
            type: DataTypes.STRING,
            allowNull: false,
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
        modelName: "Variant",
        tableName: "variants",
        timestamps: true,
        paranoid: true,
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
        },
    },
);

export const variantFields = [
    "variant_name",
    "unit",
    "category",
    "pack_size",
    "pack_type",
    "organisation_id",
    "branch_id",
    "tenant_id",
];
export default Variant;
