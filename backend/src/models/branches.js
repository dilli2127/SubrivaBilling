import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import Category from "./Category.js";
import Organisation from "./organisations.js";
import TenantAccount from "./tenant_accounts.js";

class Branch extends Model {}

Branch.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        organisation_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "organisations",
                key: "_id",
            },
            onDelete: "CASCADE",
            onUpdate: "RESTRICT",
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
        branch_name: DataTypes.STRING,
        branch_code: DataTypes.STRING,
        phone: DataTypes.STRING,
        email: DataTypes.STRING,
        address1: DataTypes.TEXT,
        address2: DataTypes.TEXT,
        city: DataTypes.STRING,
        state: DataTypes.STRING,
        pincode: DataTypes.STRING,
        is_head_office: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: "Branch",
        tableName: "branchs",
        timestamps: true,
        paranoid: true,
        defaultScope: {
            attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
        },
    },
);
Branch.belongsTo(Organisation, {
    foreignKey: "organisation_id",
    targetKey: "_id",
    as: "OrganisationItem",
});
Branch.belongsTo(TenantAccount, {
    foreignKey: "tenant_id",
    targetKey: "_id",
    as: "tenantItem",
});

export const branchFields = [
    "organisation_id",
    "branch_name",
    "branch_code",
    "phone",
    "email",
    "address1",
    "address2",
    "city",
    "state",
    "pincode",
    "is_head_office",
    "status",
    'tenant_id'
];

export default Branch;
