import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import SalesRecords from "./sales_record.js";

class Expenses extends Model {}

Expenses.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        modelName: "Expenses",
        tableName: "expenses",
        paranoid: true,
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt"],
            },
        },
    },
);


export const expensesFields = [
    "title",
    "amount",
    "date",
    "category",
    "notes",
    "organisation_id",
    "branch_id",
    "tenant_id",
];

export default Expenses;
