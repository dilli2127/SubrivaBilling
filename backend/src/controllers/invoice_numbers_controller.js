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
import InvoiceNumbers, {
    InvoiceNumbersFields,
} from "../models/invoice_number.js";

import sortConditionBuilder from "../utils/sort_condition_builder.js";
import {sequelize} from "../config/db.js";
import dayjs from "dayjs";

export async function createInvoiceNumber(req, res, next) {
    const t = await sequelize.transaction();
    try {
        const today = dayjs().format("YYYYMMDD");
         const prefix = `INV-${today}`;
        const whereCondition = {};
        whereCondition.prefix = `INV-${today}`;
        if (res.locals.branchId) {
            whereCondition.branch_id = res.locals.branchId;
        }
        if (res.locals.organisationId) {
            whereCondition.organisation_id = res.locals.organisationId;
        }
        let record = await InvoiceNumbers.findOne({
            where: whereCondition,
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!record) {
            record = await genericCreate({
                Table: InvoiceNumbers,
                json: {prefix, last_number: 1},
                fieldsToInclude: InvoiceNumbersFields,
                transaction: t,
                next,
                res,
            });
        } else {
            record.last_number += 1;
            await record.save({transaction: t});
        }

        const number = String(record.last_number).padStart(5, "0");
        const invoice_no = `${prefix}-${number}`;

        await t.commit();

        return genericResponse({
            res,
            result: {invoice_no},
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
    try {
        const json = req.body;
        const item = await genericUpdate({
            Table: InvoiceNumbers,
            condition: {_id: req.params._id},
            json,
            canUpsert: false,
            next,
            res,
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
            Table: InvoiceNumbers,
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
            Table: InvoiceNumbers,
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

export async function getLastInvoiceNumber(req, res, next) {
    try {
        const whereCondition = {};
        if (res.locals.branchId) {
            whereCondition.branch_id = res.locals.branchId;
        }
        if (res.locals.organisationId) {
            whereCondition.organisation_id = res.locals.organisationId;
        }
        const latest = await InvoiceNumbers.findOne({
            where: whereCondition,
            order: [["updatedAt", "DESC"]],
            attributes: ["prefix", "last_number"], // 🧠 Only needed columns
        });

        let invoice_no = null;

        if (latest) {
            const padded = String(latest.last_number).padStart(5, "0");
            invoice_no = `${latest.prefix}-${padded}`;
        }

        return genericResponse({
            res,
            result: {invoice_no},
            exception: null,
            pagination: null,
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
            Table: InvoiceNumbers,
            condition,
            sortConditions,
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
