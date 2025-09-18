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
import Stockaudit, {stockAuditFields} from "../models/stock_audit.js";
import sortConditionBuilder from "../utils/sort_condition_builder.js";
import Variant from "../models/Variant.js";
import Product from "../models/product.js";
import Vendor from "../models/vendor.js";
import Warehouse from "../models/ware_house.js";
import Category from "../models/Category.js";
import {Op} from "sequelize";
const populateQuery = [
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
    {
        model: Vendor,
        as: "VendorDetails",
    },
    {
        model: Warehouse,
        as: "WarehouseLocation",
    },
];

export async function create(req, res, next) {
    try {
        const json = req.body;
        const item = await genericCreate({
            Table: Stockaudit,
            json,
            fieldsToInclude: stockAuditFields,
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
            Table: Stockaudit,
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
            Table: Stockaudit,
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
            Table: Stockaudit,
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
        if (json.product) condition["product"] = json.product;
        const getResult = await genericGetAll({
            Table: Stockaudit,
            condition,
            sortConditions,
            populateQuery,
            next,
            pageNumber: json.pageNumber,
            pageLimit: json.pageLimit,
            res,
            opts: {
                scopeOptions: {allowOrgLevel: true},
            },
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
            Table: Stockaudit,
            condition,
            sortConditions,
            populateQuery,
            next,
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

export async function getAllProdcutStocks(req, res, next) {
  try {
    const { product, sortCondition, pageNumber, pageLimit, searchString } = req.body;

    // Step 1: Filter matching products by name (if search string is provided)
    let productFilter = {};
    if (searchString) {
      const productSearchCondition = {
        name: { [Op.iLike]: `%${searchString}%` },
      };

      const matchedProducts = await genericGetAllWithoutPagination({
        Table: Product,
        condition: productSearchCondition,
        sortConditions: [["name", "ASC"]],
        next,
        res
      });

      const productIds = matchedProducts.map(p => p._id);
      if (productIds.length > 0) {
        productFilter.product = { [Op.in]: productIds };
      } else {
        // No matching products found
        return genericResponse({
          res,
          result: [],
          exception: null,
          pagination: { total: 0, pageNumber, pageLimit },
          statusCode: statusCodes.SUCCESS,
        });
      }
    } else if (product) {
      productFilter.product = product;
    }

    // Step 2: Fetch stock audits with valid expiry only
    const sortConditions = lodash.defaults(sortConditionBuilder(sortCondition), [["_id", "DESC"]]);

    const { items = [], pagination } = await genericGetAll({
      Table: Stockaudit,
      condition: productFilter,
      sortConditions,
      populateQuery,
      next,
      pageNumber,
      pageLimit,
      res
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

    const totalStockSummary = Object.entries(grouped).map(([productId, records]) => {
      const { ProductItem = {} } = records[0];
      return {
        productItem: ProductItem,
        totalAvailableQuantity: records.reduce((sum, r) => sum + (r.available_quantity || 0), 0),
        totalAvailableLooseQuantity: records.reduce((sum, r) => sum + (r.available_loose_quantity || 0), 0),
      };
    });

    return genericResponse({
      res,
      result: totalStockSummary,
      exception: null,
      pagination,
      statusCode: statusCodes.SUCCESS,
    });

  } catch (error) {
    return next(error);
  }
}
