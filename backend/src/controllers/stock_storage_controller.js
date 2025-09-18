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
import StockStroage, {stockStorageFields} from "../models/stock_storage.js";

import sortConditionBuilder from "../utils/sort_condition_builder.js";
import StockAudit from "../models/stock_audit.js";
const populateQuery = ["StockAuditItem", "BranchStockItem", "RackItem"];
export async function create(req, res, next) {
    try {
        const json = req.body;
        const item = await genericCreate({
            Table: StockStroage,
            json,
            fieldsToInclude: stockStorageFields,
            next,
            res
        });
         const StockAuditItems = await genericUpdate({
            Table: StockAudit,
            condition: {_id: req.params._id},
            json,
            canUpsert: false,
            next,
            res
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
            Table: StockStroage,
            condition: {_id: req.params._id},
            json,
            canUpsert: false,
            next,
            res
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
            Table: StockStroage,
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
            Table: StockStroage,
            condition: {_id: req.params._id},
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
        const getResult = await genericGetAll({
            Table: StockStroage,
            condition,
            sortConditions,
            next,
            populateQuery,
            pageNumber: json.pageNumber,
            pageLimit: json.pageLimit,
            res
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
            Table: StockStroage,
            condition,
            sortConditions,
            next,
            populateQuery,
            pageNumber: json.pageNumber,
            pageLimit: json.pageLimit,
            res
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
