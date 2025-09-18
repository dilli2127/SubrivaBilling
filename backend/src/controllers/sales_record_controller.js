import lodash from "lodash";
import {genericResponse} from "./base_controllers.js";
import {
    genericCreate,
    genericGetAll,
    genericGetAllWithoutPagination,
    genericGetOne,
    genericUpdate,
    genericDelete,
} from "./generic_controller.js";

import {statusCodes} from "../config/constants.js";
import SalesRecords, {salesRecordFields} from "../models/sales_record.js";
import SalesRecordItems, {
    salesRecordItemsFields,
} from "../models/sales_record_items.js";
import sortConditionBuilder from "../utils/sort_condition_builder.js";
import {sequelize} from "../config/db.js";
import Product from "../models/product.js";
import StockAudit from "../models/stock_audit.js";
import Customer from "../models/customer.js";
import Variant from "../models/Variant.js";
import Category from "../models/Category.js";
import {json, Op} from "sequelize";
import PaymentHistory from "../models/payment_historys.js";
import BranchStockControl from "../models/branch_stock.js";
const populateQuery = [
    {
        model: SalesRecordItems,
        as: "Items",
        include: [
            {
                model: Product,
                as: "productItems",
                include: [
                    {
                        model: Variant,
                        as: "VariantItem",
                    },
                    {
                        model: Category,
                        as: "CategoryItem",
                    },
                ],
            },
            {
                model: StockAudit,
                as: "stockAuditItems",
            },
        ],
    },
    {
        model: Customer,
        as: "customerDetails",
    },
];
export async function create(req, res, next) {
    const t = await sequelize.transaction();
    try {
        const {items = [], paid_amount = 0} = req.body;
        json.invoice_no = req.body.invoice_no || null;
        let checkDuplicate = await genericGetOne({
            Table: SalesRecords,
            condition: {invoice_no: json.invoice_no},
            next,
            attributes: ["invoice_no"],
        });
        if (checkDuplicate)
            return genericResponse({
                res,
                result: null,
                exception: "Duplicate Bill No",
                message: "Bill No already exists",
                pagination: null,
                statusCode: statusCodes.DUPLICATE,
            });
        // 1. Create Sales Record
        const bill = await genericCreate({
            Table: SalesRecords,
            json: req.body,
            fieldsToInclude: salesRecordFields,
            next,
            transaction: t,
            res,
        });

        // 2. Bulk Create Sales Items
        if (items.length) {
            const mappedItems = items.map(item => ({
                ...lodash.pick(item, salesRecordItemsFields),
                sales_record_id: bill._id,
                tenant_id: res.locals.tenantId,
                organisation_id: res.locals.organisationId,
                branch_id: res.locals.branchId,
            }));
            await SalesRecordItems.bulkCreate(mappedItems, {transaction: t});
        }

        // 3. Auto Payment Entry
        if (Number(paid_amount) > 0) {
            await PaymentHistory.create(
                {
                    sales_record_id: bill._id,
                    amount_paid: paid_amount,
                    payment_mode: req.body.payment_mode || "cash",
                    payment_date: new Date(),
                    note: "Auto entry from bill creation",
                    tenant_id: res.locals.tenantId,
                    organisation_id: res.locals.organisationId,
                    branch_id: res.locals.branchId,
                },
                {transaction: t},
            );
        }

        // 4. Update Stock Quantities
        if (res.locals.usertype === "OrganisationAdmin") {
            for (const item of items) {
                const stock = await StockAudit.findOne({
                    where: {_id: item.stock_id},
                    include: [
                        {
                            model: Product,
                            as: "ProductItem",
                            include: [
                                {
                                    model: Variant,
                                    as: "VariantItem",
                                },
                            ],
                        },
                    ],
                    transaction: t,
                });

                if (!stock || !stock.ProductItem?.VariantItem) {
                    throw new Error(
                        "Stock or associated product/variant not found.",
                    );
                }

                const packSize = Number(
                    stock.ProductItem.VariantItem.pack_size || 1,
                );
                const strips = Number(item.qty || 0);
                const loose = Number(item.loose_qty || 0);
                const totalToDeduct = strips * packSize + loose;
                const totalAvailable =
                    stock.available_quantity * packSize +
                    stock.available_loose_quantity;

                if (totalToDeduct > totalAvailable) {
                    throw new Error("Insufficient stock for product.");
                }

                let {available_quantity, available_loose_quantity} = stock;

                // Loose quantity handling
                if (loose <= available_loose_quantity) {
                    available_loose_quantity -= loose;
                } else {
                    const extraLooseNeeded = loose - available_loose_quantity;
                    const packsToOpen = Math.ceil(extraLooseNeeded / packSize);

                    if (available_quantity < packsToOpen) {
                        throw new Error(
                            "Not enough full packs to break for loose units.",
                        );
                    }

                    available_quantity -= packsToOpen;
                    available_loose_quantity =
                        packsToOpen * packSize - extraLooseNeeded;
                }

                // Strip quantity handling
                if (available_quantity < strips) {
                    throw new Error("Not enough full packs available.");
                }

                available_quantity -= strips;

                // Save updated stock
                stock.available_quantity = available_quantity;
                stock.available_loose_quantity = available_loose_quantity;
                await stock.save({transaction: t});
            }
        } else {
            for (const item of items) {
                const stock = await BranchStockControl.findOne({
                    where: {_id: item.branch_stock_id},
                    include: [
                        {
                            model: Product,
                            as: "ProductItem",
                            include: [
                                {
                                    model: Variant,
                                    as: "VariantItem",
                                },
                            ],
                        },
                    ],
                    transaction: t,
                });

                if (!stock || !stock.ProductItem?.VariantItem) {
                    throw new Error(
                        "Stock or associated product/variant not found.",
                    );
                }

                const packSize = Number(
                    stock.ProductItem.VariantItem.pack_size || 1,
                );
                const strips = Number(item.qty || 0);
                const loose = Number(item.loose_qty || 0);
                const totalToDeduct = strips * packSize + loose;
                const totalAvailable =
                    stock.available_quantity * packSize +
                    stock.available_loose_quantity;

                if (totalToDeduct > totalAvailable) {
                    throw new Error("Insufficient stock for product.");
                }

                let {available_quantity, available_loose_quantity} = stock;

                // Loose quantity handling
                if (loose <= available_loose_quantity) {
                    available_loose_quantity -= loose;
                } else {
                    const extraLooseNeeded = loose - available_loose_quantity;
                    const packsToOpen = Math.ceil(extraLooseNeeded / packSize);

                    if (available_quantity < packsToOpen) {
                        throw new Error(
                            "Not enough full packs to break for loose units.",
                        );
                    }

                    available_quantity -= packsToOpen;
                    available_loose_quantity =
                        packsToOpen * packSize - extraLooseNeeded;
                }

                // Strip quantity handling
                if (available_quantity < strips) {
                    throw new Error("Not enough full packs available.");
                }

                available_quantity -= strips;

                // Save updated stock
                stock.available_quantity = available_quantity;
                stock.available_loose_quantity = available_loose_quantity;
                await stock.save({transaction: t});
            }
        }

        await t.commit();

        return genericResponse({
            res,
            result: bill,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        await t.rollback();
        return next(error);
    }
}

export async function update(req, res, next) {
    const t = await sequelize.transaction();
    try {
        const json = req.body;
        const billId = req.params._id;

        // Step 1: Update main bill
        const bill = await genericUpdate({
            Table: SalesRecords,
            condition: {_id: billId},
            json,
            canUpsert: false,
            next,
            transaction: t,
            res,
        });

        if (!bill) {
            await t.rollback();
            return res.status(404).json({message: "not found"});
        }

        // Step 2: Handle bill items
        const incomingItems = json.items || [];

        const incomingItemIds = incomingItems
            .filter(item => item._id)
            .map(item => item._id);

        // Step 3: Delete items that are removed
        await SalesRecordItems.destroy({
            where: {
                sales_record_id: billId,
                _id: {[Op.notIn]: incomingItemIds},
            },
            transaction: t,
        });

        // Step 4: Upsert (insert/update) each item
        for (const item of incomingItems) {
            const data = {
                ...lodash.pick(item, salesRecordItemsFields),
                sales_record_id: billId,
            };

            if (item._id) {
                // Existing item → update
                await SalesRecordItems.update(data, {
                    where: {_id: item._id},
                    transaction: t,
                });
            } else {
                // New item → insert
                await SalesRecordItems.create(data, {transaction: t});
            }
        }

        await t.commit();

        return genericResponse({
            res,
            result: bill,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        await t.rollback();
        return next(error);
    }
}

export async function remove(req, res, next) {
    try {
        await genericDelete({
            Table: SalesRecords,
            condition: {_id: req.params._id},
            next,
            softDelete: false,
        });
        return genericResponse({
            res,
            result: null,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getOne(req, res, next) {
    try {
        let item = await genericGetOne({
            Table: SalesRecords,
            condition: {_id: req.params._id},
            populateQuery,
            next,
        });
        if (item) item = item.toJSON();

        return genericResponse({
            res,
            result: item || null,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getAll(req, res, next) {
    try {
        const json = req.body;
        const defaultSortConditions = [["_id", "DESC"]];
        const sortConditions = lodash.defaults(
            sortConditionBuilder(json.sortCondition),
            defaultSortConditions,
        );

        let condition = {};
        if (json.searchString)
            condition["invoice_no"] = {[Op.iLike]: `%${json.searchString}%`};
        const getResult = await genericGetAll({
            Table: SalesRecords,
            condition,
            sortConditions,
            populateQuery,
            next,
            pageNumber: json.pageNumber,
            pageLimit: json.pageLimit,
            include: [],
            res,
        });

        let {items} = getResult;
        const {pagination} = getResult;

        if (items) items = items.map(x => x.toJSON());

        return genericResponse({
            res,
            result: items,
            exception: null,
            pagination,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getAllWithoutPagination(req, res, next) {
    try {
        const json = req.body;
        const sortConditions = [["_id", "DESC"]];
        const condition = {};

        let getResult = await genericGetAllWithoutPagination({
            Table: SalesRecords,
            condition,
            sortConditions,
            populateQuery,
            next,
            include: [],
            res,
        });

        if (getResult) getResult = getResult.map(x => x.toJSON());

        return genericResponse({
            res,
            result: getResult,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}
