import {DataTypes, Model, NOW} from "sequelize";

import {sequelize} from "../config/db.js";

export default class JWTAccess extends Model {}

JWTAccess.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        JWT: {type: DataTypes.TEXT, unique: true},
        User: {type: DataTypes.TEXT, allowNull: false},
        LastUsed: {type: DataTypes.BIGINT, allowNull: false},
        ExpiresOn: {type: DataTypes.BIGINT},
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
            allowNull: true,
            references: {
                model: "tenant_accounts",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        deletedAt: {type: DataTypes.DATE, defaultValue: null, allowNull: true},
        createdAt: {type: DataTypes.DATE, defaultValue: NOW, allowNull: false},
        updatedAt: {type: DataTypes.DATE, defaultValue: NOW, allowNull: false},
    },
    {
        sequelize,
        paranoid: true,
        modelName: "jwt_access",
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
        },
    },
);

export const jwtFields = [
    "JWT",
    "User",
    "LastUsed",
    "ExpiresOn",
    "organisation_id",
    "branch_id",
    "tenant_id",
];
