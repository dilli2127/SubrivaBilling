import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import Organisation from "./organisations.js";
import TenantAccount from "./tenant_accounts.js";
import Branch from "./branches.js";

class Category extends Model {}

Category.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        category_name: {
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
        hsn_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tax_percentage: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Category",
        tableName: "categories",
        paranoid: true,
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt"],
            },
        },
    },
);

export const categoryFields = [
    "category_name",
    "hsn_code",
    "tax_percentage",
    "tenant_id",
    "organisation_id",
    "branch_id",
];

export default Category;
