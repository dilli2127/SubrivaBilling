import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";

class Roles extends Model {}

Roles.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
        },
        allowedMenuKeys: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
        organisation_id: {
            type: DataTypes.UUID,
            allowNull: true,
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
        modelName: "Roles",
        tableName: "roles",
        timestamps: true,
        paranoid: true,
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
        },
    },
);

export const RolesFields = [
    "name",
    "description",
    "allowedMenuKeys",
    "organisation_id",
    "branch_id",
    "tenant_id",
];

export default Roles;
