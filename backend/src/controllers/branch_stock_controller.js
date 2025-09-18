import lodash from "lodash";
import {genericResponse} from "../controllers/base_controllers.js";
import {
    genericCreate,
    genericGetAll,
    genericGetAllWithoutPagination,
    genericGetOne,
    genericUpdate,
    genericDelete,
} from "./generic_controller.js";

import {statusCodes} from "../config/constants.js";
import BranchStock, {branchStockControlFields} from "../models/branch_stock.js";

import sortConditionBuilder from "../utils/sort_condition_builder.js";
import {sequelize} from "../config/db.js";
import StockAudit from "../models/stock_audit.js";
import Product from "../models/product.js";
import Variant from "../models/Variant.js";
import Category from "../models/Category.js";
const populateQuery = [
    "Branch",
    {
        model: Product,
        as: "ProductItem",
        include: [
            {model: Variant, as: "VariantItem"},
            {
                model: Category,
                as: "CategoryItem",
            },
        ],
    },
];
export async function create(req, res, next) {
    try {
        const json = req.body;

        json.available_quantity = json.added_quantity;

        const item = await genericCreate({
            Table: BranchStock,
            json,
            fieldsToInclude: branchStockControlFields,
            next,
            res,
        });

        await genericUpdate({
            Table: StockAudit,
            condition: {_id: json.stock_audit_id},
            json: {
                available_quantity: sequelize.literal(
                    `available_quantity - ${json.added_quantity}`,
                ),
            },
            canUpsert: false,
            next,
        });

        return genericResponse({
            res,
            result: item || null,
            exception: null,
            pagination: null,
            statusCode: item ? statusCodes.SUCCESS : statusCodes.SERVER_ERROR,
        });
    } catch (error) {
        return next(error);
    }
}

export async function update(req, res, next) {
    try {
        const json = req.body;
        const item = await genericUpdate({
            Table: BranchStock,
            condition: {_id: req.params._id},
            json,
            canUpsert: false,
            next,
        });
        return genericResponse({
            res,
            result: item,
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}

export async function remove(req, res, next) {
    try {
        await genericDelete({
            Table: BranchStock,
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
            Table: BranchStock,
            condition: {_id: req.params._id},
            next,
            populateQuery,
            res,
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
        if (json.product) condition["product"] = json.product;
        const getResult = await genericGetAll({
            Table: BranchStock,
            condition,
            sortConditions,
            next,
            pageNumber: json.pageNumber,
            pageLimit: json.pageLimit,
            res,
            populateQuery,
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
            Table: BranchStock,
            condition,
            sortConditions,
            next,
            pageNumber: json.pageNumber,
            pageLimit: json.pageLimit,
            res,
            populateQuery,
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

export async function revert(req, res, next) {
    try {
        const json = req.body;

        await genericUpdate({
            Table: BranchStock,
            condition: {_id: json.branch_id},
            json: {
                available_quantity: sequelize.literal(
                    `available_quantity - ${json.reverted_quantity}`,
                ),
            },
            canUpsert: false,
            next,
        });

        await genericUpdate({
            Table: StockAudit,
            condition: {_id: json.stock_audit_id},
            json: {
                available_quantity: sequelize.literal(
                    `available_quantity + ${json.reverted_quantity}`,
                ),
            },
            canUpsert: false,
            next,
        });

        return genericResponse({
            res,
            result: {message: "Stock reverted successfully"},
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getAllProdcutBranchStocks(req, res, next) {
    try {
        const {product, sortCondition, pageNumber, pageLimit, searchString} =
            req.body;

        // Step 1: Filter matching products by name (if search string is provided)
        let productFilter = {};
        if (searchString) {
            const productSearchCondition = {
                name: {[Op.iLike]: `%${searchString}%`},
            };

            const matchedProducts = await genericGetAllWithoutPagination({
                Table: Product,
                condition: productSearchCondition,
                sortConditions: [["name", "ASC"]],
                next,
                res,
            });

            const productIds = matchedProducts.map(p => p._id);
            if (productIds.length > 0) {
                productFilter.product = {[Op.in]: productIds};
            } else {
                // No matching products found
                return genericResponse({
                    res,
                    result: [],
                    exception: null,
                    pagination: {total: 0, pageNumber, pageLimit},
                    statusCode: statusCodes.SUCCESS,
                });
            }
        } else if (product) {
            productFilter.product = product;
        }

        // Step 2: Fetch stock audits with valid expiry only
        const sortConditions = lodash.defaults(
            sortConditionBuilder(sortCondition),
            [["_id", "DESC"]],
        );

        const {items = [], pagination} = await genericGetAll({
            Table: BranchStock,
            condition: productFilter,
            sortConditions,
            populateQuery,
            next,
            pageNumber,
            pageLimit,
            res,
        });

        const now = new Date();
        const filteredItems = items
            .map(item => item.toJSON())
            .filter(item => new Date(item.expiry_date) >= now);

        if (filteredItems.length === 0) {
            return genericResponse({
                res,
                result: [],
                exception: null,
                pagination,
                statusCode: statusCodes.SUCCESS,
            });
        }

        // Step 3: Group by product and summarize
        const grouped = lodash.groupBy(filteredItems, item => item.product);

        const totalStockSummary = Object.entries(grouped).map(
            ([productId, records]) => {
                const {ProductItem = {}} = records[0];
                return {
                    productItem: ProductItem,
                    totalAvailableQuantity: records.reduce(
                        (sum, r) => sum + (r.available_quantity || 0),
                        0,
                    ),
                    totalAvailableLooseQuantity: records.reduce(
                        (sum, r) => sum + (r.available_loose_quantity || 0),
                        0,
                    ),
                };
            },
        );

        return genericResponse({
            res,
            result: totalStockSummary,
            exception: null,
            pagination: totalStockSummary?.length,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return next(error);
    }
}
