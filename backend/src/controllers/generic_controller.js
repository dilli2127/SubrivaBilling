import lodash from "lodash";
import { Op } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * Apply user scope to condition (branch/org/tenant).
 * Supports allowOrgLevel to show both branch and org data.
 */
function applyUserScope(condition = {}, scope = {}, options = {}) {
  if (options.allowOrgLevel && scope.organisationId) {
    const orConditions = [];

    if (scope.branchId) {
      orConditions.push({ branch_id: scope.branchId });
    }

    orConditions.push({ organisation_id: scope.organisationId });

    condition[Op.or] = orConditions;
  } else if (scope.branchId) {
    condition.branch_id = scope.branchId;
  } else if (scope.organisationId) {
    condition.organisation_id = scope.organisationId;
  } else if (scope.tenantId) {
    condition.tenant_id = scope.tenantId;
  }

  return condition;
}

// Generic Create
export async function genericCreate({
  Table,
  json,
  fieldsToInclude,
  fieldsToExclude = [],
  res = null,
}) {
  try {
    if (res?.locals) {
      const { branchId, organisationId, tenantId } = res.locals;
      if (branchId) json.branch_id = branchId;
      if (organisationId) json.organisation_id = organisationId;
      if (tenantId) json.tenant_id = tenantId;
    }

    if (fieldsToExclude.length) {
      json = lodash.omit(json, fieldsToExclude);
    }

    const item = await Table.create(json, { fields: fieldsToInclude });
    return item.toJSON();
  } catch (error) {
    throw error;
  }
}

// Generic Update
export async function genericUpdate({
  Table,
  condition,
  json,
  canUpsert,
  fieldsToExclude = [],
  res = null,
}) {
  try {
    if (res?.locals) {
      const { branchId, organisationId, tenantId } = res.locals;
      if (branchId) json.branch_id = branchId;
      if (organisationId) json.organisation_id = organisationId;
      if (tenantId) json.tenant_id = tenantId;
    }

    if (fieldsToExclude.length) {
      json = lodash.omit(json, fieldsToExclude);
    }

    const fieldsToRemove = ["__v", "createdAt", "updatedAt"];
    condition = lodash.omit(condition, fieldsToRemove);
    json = lodash.omit(json, fieldsToRemove);

    if (!condition.where) condition = { where: condition };

    let item = await Table.findOne(condition);
    if (!item) {
      if (canUpsert) {
        item = await Table.create(json);
      } else {
        throw new Error("Item not found");
      }
    } else {
      lodash.assign(item, json);
      await item.save();
    }

    return item;
  } catch (error) {
    throw error;
  }
}

// Generic Get One
export async function genericGetOne({
  Table,
  condition,
  populateQuery,
  sortConditions,
  opts,
}) {
  try {
    const finalCondition = {
      where: condition,
      include: populateQuery || [],
      order: sortConditions ? [sortConditions] : [],
      ...opts,
    };
    return await Table.findOne(finalCondition);
  } catch (error) {
    throw error;
  }
}

// Generic Delete
export async function genericDelete({ Table, condition }) {
  try {
    await Table.destroy({ where: condition });
    return true;
  } catch (error) {
    throw error;
  }
}

// Generic Hard Delete
export async function genericHardDelete({ Table, condition }) {
  try {
    await Table.destroy({ where: condition, force: true });
    return true;
  } catch (error) {
    throw error;
  }
}

// Generic Get All with Pagination and Scope
export async function genericGetAll({
  Table,
  condition = {},
  populateQuery,
  sortConditions,
  pageNumber = 1,
  pageLimit = 10,
  opts = {},
  req = null,
  res = res || {},
}) {
  try {
    const skipCount = pageLimit * (pageNumber - 1);
    const scope = res?.locals || {};

    // ✅ Apply scope with options (e.g. allowOrgLevel: true)
    condition = applyUserScope(condition, scope, opts?.scopeOptions || {});

    const finalCondition = {
      where: condition,
      include: populateQuery || [],
      order: sortConditions ? [sortConditions] : [],
      offset: skipCount,
      limit: pageLimit,
      distinct: true,
      ...opts,
    };

    const result = await Table.findAndCountAll(finalCondition);
    const pagination = {
      pageNumber,
      pageLimit,
      skipCount,
      totalCount: result.count,
    };

    return { items: result.rows, pagination };
  } catch (error) {
    throw error;
  }
}

// Generic Get All Without Pagination
export async function genericGetAllWithoutPagination({
  Table,
  condition = {},
  populateQuery,
  sortConditions,
  opts = {},
  res = null,
}) {
  try {
    const scope = res?.locals || {};

    // ✅ Apply scope with options (e.g. allowOrgLevel: true)
    condition = applyUserScope(condition, scope, opts?.scopeOptions || {});

    const finalCondition = {
      where: condition,
      include: populateQuery || [],
      order: sortConditions ? [sortConditions] : [],
      ...opts,
    };

    return await Table.findAll(finalCondition);
  } catch (error) {
    throw error;
  }
}

// Execute Raw SQL Query
export async function executeRawQuery({ query }) {
  try {
    const [results, metadata] = await sequelize.query(query);
    return { results, metadata };
  } catch (error) {
    throw error;
  }
}

// Utility: Deep Clone Array
export function getNewArray(arr = []) {
  return lodash.cloneDeep(arr);
}

// Utility: Deep Clone Object
export function getNewObject(obj = {}) {
  return lodash.cloneDeep(obj);
}

// Count Records
export async function getCount({ Table, condition }) {
  try {
    return await Table.count({ where: condition });
  } catch (error) {
    throw error;
  }
}
