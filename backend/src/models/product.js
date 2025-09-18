import {DataTypes, Model, Sequelize} from "sequelize";
import {sequelize} from "../config/db.js";
import Category from "./Category.js";
import Unit from "./unit.js";
import Variant from "./Variant.js";

class Product extends Model {}

Product.init(
    {
        _id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "categories",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        sku: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        variant: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "variants",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        status: {
            type: DataTypes.BOOLEAN,
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
        modelName: "Product",
        tableName: "products",
        paranoid: true,
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt"],
            },
        },
    },
);
Product.hasOne(Category, {
    as: "CategoryItem",
    sourceKey: "category",
    foreignKey: "_id",
});

Product.hasOne(Variant, {
    as: "VariantItem",
    sourceKey: "variant",
    foreignKey: "_id",
});
// Optional: use actual model field names
export const productFields = [
    "name",
    "category",
    "sku",
    "variant",
    "status",
    "organisation_id",
    "branch_id",
    "tenant_id",
];
export default Product;
