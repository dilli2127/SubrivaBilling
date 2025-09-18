import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";

class Unit extends Model {}

Unit.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        unit_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unit_code: {
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
        modelName: "Unit",
        tableName: "units",
        timestamps: true, // enables createdAt and updatedAt
        paranoid: true, // enables deletedAt (soft delete)
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
        },
    },
);

export const unitFields = [
    "unit_name",
    "unit_code",
    "organisation_id",
    "branch_id",
    "tenant_id",
];
export default Unit;
