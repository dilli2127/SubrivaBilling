import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import Roles from "./roles.js";
import Organisation from "./organisations.js";
import Branch from "./branches.js";
import TenantAccount from "./tenant_accounts.js";

class BillingUsers extends Model {}

BillingUsers.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
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
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "roles",
                key: "_id",
            },
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: "BillingUsers",
        tableName: "billing_users",
        timestamps: true,
        paranoid: true,
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
        },
    },
);
BillingUsers.belongsTo(Roles, {
    foreignKey: "role_id",
    as: "roleItems",
});
BillingUsers.belongsTo(Organisation, {
    foreignKey: "organisation_id",
    as: "organisationItems",
});
BillingUsers.belongsTo(Branch, {
    foreignKey: "branch_id",
    as: "branchItems",
});

BillingUsers.belongsTo(TenantAccount, {
    foreignKey: "tenant_id",
    as: "tenantItems",
});


export const BillingUsersFields = [
    "name",
    "email",
    "user_name",
    "mobile",
    "role_id",
    "status",
    "password",
    "organisation_id",
    "branch_id",
    "tenant_id",
];

export default BillingUsers;
