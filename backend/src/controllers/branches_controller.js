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
import Branches, {branchFields} from "../models/branches.js";

import sortConditionBuilder from "../utils/sort_condition_builder.js";
import {formatSequelizeError} from "../utils/sequelizeErrorHandler.js";
const populateQuery = ["OrganisationItem"];
export async function create(req, res, next) {
    try {
        const json = req.body;
        const item = await genericCreate({
            Table: Branches,
            json,
            fieldsToInclude: branchFields,
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
        const {message, statusCode} = formatSequelizeError(error);
        return genericResponse({
            res,
            result: null,
            message,
            exception: message,
            statusCode,
            pagination: null,
        });
    }
}

export async function update(req, res, next) {
    try {
        const json = req.body;
        const item = await genericUpdate({
            Table: Branches,
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
            Table: Branches,
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
            Table: Branches,
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
            Table: Branches,
            condition,
            sortConditions,
            populateQuery,
            next,
            pageNumber: json.pageNumber,
            pageLimit: json.pageLimit,
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
            Table: Branches,
            condition,
            sortConditions,
            populateQuery,
            next,
            pageNumber: json.pageNumber,
            pageLimit: json.pageLimit,
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
