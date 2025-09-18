import {Op, Sequelize, col, fn, literal} from "sequelize";
import dayjs from "dayjs";
import SalesRecord from "../models/sales_record.js";
import Customer from "../models/customer.js";
import StockAudit from "../models/stock_audit.js";
import SalesRecords from "../models/sales_record.js";
import {statusCodes} from "../config/constants.js";
import {genericResponse} from "./base_controllers.js";
import Product from "../models/product.js";
import Variant from "../models/Variant.js";

export async function getDashboardStats(req, res, next) {
    try {
        const today = dayjs().startOf("day").toDate();
        const weekStart = dayjs().startOf("week").toDate();
        const weekEnd = dayjs().endOf("week").toDate();

        const totalSales = await SalesRecord.sum("total_amount");

        const todaysSales = await SalesRecord.sum("total_amount", {
            where: {date: {[Op.gte]: today}},
        });

        const weeklyPayments = await SalesRecord.sum("paid_amount", {
            where: {date: {[Op.between]: [weekStart, weekEnd]}},
        });

        const pendingReceivablesResult = await SalesRecord.findAll({
            attributes: [
                [
                    Sequelize.literal("SUM(total_amount - paid_amount)"),
                    "pending_amount",
                ],
            ],
            where: Sequelize.where(
                Sequelize.col("paid_amount"),
                "<",
                Sequelize.col("total_amount"),
            ),
            raw: true,
        });

        const pendingReceivables = parseFloat(
            pendingReceivablesResult[0]?.pending_amount || 0,
        );

        const totalRecords = await SalesRecord.count();
        const totalCustomers = await Customer.count();

        return genericResponse({
            res,
            result: {
                totalSales: totalSales || 0,
                todaysSales: todaysSales || 0,
                weeklyPayments: weeklyPayments || 0,
                pendingReceivables,
                totalRecords,
                totalCustomers,
            },
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        next(err);
    }
}

export async function getSalesChartData(req, res, next) {
    try {
        const today = dayjs().startOf("day");
        const sevenDaysAgo = today.subtract(6, "day");

        const result = await SalesRecord.findAll({
            attributes: [
                [Sequelize.fn("DATE", Sequelize.col("date")), "date"],
                [Sequelize.fn("SUM", Sequelize.col("total_amount")), "sales"],
            ],
            where: {
                date: {
                    [Op.between]: [
                        sevenDaysAgo.toDate(),
                        today.endOf("day").toDate(),
                    ],
                },
            },
            group: [Sequelize.fn("DATE", Sequelize.col("date"))],
            order: [[Sequelize.fn("DATE", Sequelize.col("date")), "ASC"]],
            raw: true,
        });

        const salesData = [];
        for (let i = 0; i < 7; i++) {
            const date = today.subtract(6 - i, "day").format("YYYY-MM-DD");
            const dayData = result.find(
                d => dayjs(d.date).format("YYYY-MM-DD") === date,
            );
            salesData.push({
                date,
                sales: dayData ? parseFloat(dayData.sales) : 0,
            });
        }

        return genericResponse({
            res,
            result: salesData,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (err) {
        console.error("Sales Chart Error:", err);
        next(err);
    }
}

export async function getWeeklyPurchaseData(req, res, next) {
    try {
        const today = dayjs().startOf("day");
        const start = today.subtract(6, "day");
        const end = today.endOf("day");

        const rawData = await StockAudit.findAll({
            attributes: [
                [
                    Sequelize.literal(`TO_CHAR("buyed_date", 'YYYY-MM-DD')`),
                    "date",
                ],
                [
                    Sequelize.literal(
                        `SUM(CAST("buy_price" AS FLOAT) * "quantity")`,
                    ),
                    "amount",
                ],
            ],
            where: {
                buyed_date: {
                    [Op.between]: [start.toDate(), end.toDate()],
                },
            },
            group: [Sequelize.literal(`TO_CHAR("buyed_date", 'YYYY-MM-DD')`)],
            order: [
                [
                    Sequelize.literal(`TO_CHAR("buyed_date", 'YYYY-MM-DD')`),
                    "ASC",
                ],
            ],
            raw: true,
        });

        const dataMap = {};
        rawData.forEach(entry => {
            dataMap[entry.date] = parseFloat(entry.amount);
        });

        const result = [];
        for (let i = 0; i < 7; i++) {
            const date = start.add(i, "day").format("YYYY-MM-DD");
            result.push({
                date,
                amount: dataMap[date] || 0,
            });
        }

        return genericResponse({
            res,
            result,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (err) {
        console.error("Weekly Purchase Chart Error:", err);
        next(err);
    }
}

export async function getGroupedStockAlerts(req, res, next) {
    try {
        const LOW_STOCK_THRESHOLD = 10;

        // Step 1: Fetch stock entries with Product + Variant
        const stocks = await StockAudit.findAll({
            include: [
                {
                    model: Product,
                    as: "ProductItem",
                    include: [{model: Variant, as: "VariantItem"}],
                },
            ],
        });

        // Step 2: Group by product ID
        const grouped = {};

        for (const stock of stocks) {
            const item = stock.toJSON();
            const productId = item.product;
            const qty = item.available_quantity || 0;

            if (!grouped[productId]) {
                grouped[productId] = {
                    quantity: 0,
                    name: item.ProductItem?.name || "Unnamed",
                    variant: item.ProductItem?.VariantItem?.variant_name || "",
                };
            }

            grouped[productId].quantity += qty;
        }

        // Step 3: Prepare alert list (only products below threshold)
        const stockAlerts = Object.values(grouped)
            .filter(p => p.quantity <= LOW_STOCK_THRESHOLD)
            .map(p => ({
                item: p.variant ? `${p.name} - ${p.variant}` : p.name,
                quantity: p.quantity,
            }));

        return genericResponse({
            res,
            result: stockAlerts,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}
