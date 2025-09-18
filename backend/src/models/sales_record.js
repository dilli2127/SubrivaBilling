import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import Customer from "./customer.js";
import SalesRecordItems from "./sales_record_items.js";

class SalesRecords extends Model {}

SalesRecords.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        invoice_no: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        is_paid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_gst_included: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_partially_paid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "customers",
                key: "_id",
            },
             onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        sale_type: {
            type: DataTypes.ENUM("retail", "wholesale"),
            allowNull: false,
            defaultValue: "retail",
        },
        paid_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        sub_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        total_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        payment_mode: {
            type: DataTypes.ENUM("cash", "upi", "card"),
            allowNull: false,
            defaultValue: "cash",
        },
        value_of_goods: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        total_gst: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        discount_type: {
            type: DataTypes.ENUM("percentage", "amount"),
            allowNull: false,
            defaultValue: "percentage",
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
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
        modelName: "SalesRecords",
        tableName: "sales_records",
        paranoid: true,
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt"],
            },
        },
    },
);

SalesRecords.belongsTo(Customer, {
    foreignKey: "customer_id",
    as: "customerDetails",
});
SalesRecords.hasMany(SalesRecordItems, {
    foreignKey: "sales_record_id",
    as: "Items",
});

export const salesRecordFields = [
    "invoice_no",
    "date",
    "customer_id",
    "payment_mode",
    "total_amount",
    "is_paid",
    "is_partially_paid",
    "paid_amount",
    "sale_type",
    "value_of_goods",
    "total_gst",
    "discount_type",
    "discount",
    "is_gst_included",
    "sub_total",
    "organisation_id",
    "branch_id",
    "tenant_id",

];

export default SalesRecords;
