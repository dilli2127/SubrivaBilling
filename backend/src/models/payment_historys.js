import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.js";
import SalesRecords from "./sales_record.js";


class PaymentHistory extends Model {}

PaymentHistory.init(
    {
        _id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        sales_record_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        payment_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal("NOW()"),
        },
        amount_paid: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_mode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        note: {
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
        modelName: "PaymentHistory",
        tableName: "payment_histories",
        paranoid: true,
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt"],
            },
        },
    },
);

PaymentHistory.belongsTo(SalesRecords, {
    foreignKey: "sales_record_id",
    as: "sales_record_items",
});

export const PaymentHistoryFields = [
    "sales_record_id",
    "payment_date",
    "amount_paid",
    "payment_mode",
    "note",
    "organisation_id",
    "branch_id",
    "tenant_id",
];

export default PaymentHistory;
