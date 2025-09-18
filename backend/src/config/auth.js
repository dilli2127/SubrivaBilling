import jwt from "jsonwebtoken";
import {Op} from "sequelize";
import {getClientIp} from "request-ip";
import * as ENV from "../config/environment.js";
import {
    statusCodes,
    jwtExpirationTime,
    AccessRightMethods,
    jwt_expiresInHours,
} from "./constants.js";

import {
    updateJWTLastUsed,
    consumeJWT,
} from "../controllers/jwt_access_controller.js";

import {genericResponse, getUtcUnix} from "../controllers/base_controllers.js";
import JWTAccess from "../models/jwt_access.js";
// import OlgprsUsers from "../models/olgprs_users.js";
import {genericGetOne} from "../controllers/generic_controller.js";
import Users from "../models/users.js";
import TenantAccount from "../models/tenant_accounts.js";
import BillingUsers from "../models/billing_users.js";

export const getCurrentUser = async token => {
    if (!token) return {user: null};

    try {
        const currentDateTime = getUtcUnix();
        const jwtAccessItem = await genericGetOne({
            Table: JWTAccess,
            condition: {JWT: token},
        });

        if (!jwtAccessItem) return {user: null};
        let date = new Date(jwtAccessItem.LastUsed * 1000);
        date.setHours(date.getHours() + jwt_expiresInHours);
        const updatedEpochTime = Math.floor(date.getTime() / 1000);
        if (currentDateTime > updatedEpochTime)
            return {user: null, isTimedOut: true};

        const user = await jwt.verify(token, ENV.secretKey);

        return user;
    } catch (err) {
        return {user: null};
    }
};

export async function userResolver(req, res, next) {
    if (!res.locals.skipResponse) {
        let invalidreq = await validaterequest(req.body);
        if (invalidreq)
            return genericResponse({
                res,
                result: null,
                exception: "Invalid Data",
                pagination: null,
                statusCode: statusCodes.INVALID_DATA,
            });
    }

    const {token} = req.headers;
    const {user, iat} = await getCurrentUser(token);

    if (user) {
        const opts = {
            attributes: {
                include: ["name"],
            },
        };

        const item = await genericGetOne({
            Table: BillingUsers,
            condition: {_id: user.userId},
            populateQuery: ["roleItems"],
            opts,
        });

        if (item) {
            updateJWTLastUsed(token, res);
            res.locals.UserID = item._id;
            res.locals.usertype = item.roleItems?.name;
            res.locals.roleId = item.role_id;
            res.locals.organisationId = item.organisation_id;
            res.locals.branchId = item.branch_id;
            res.locals.tenantId = item.tenant_id;
            next();
            return true;
        }
    } else {
        if (!res.locals.skipResponse)
            return genericResponse({
                res,
                result: null,
                exception: "Token expired",
                pagination: null,
                stringResult: "Token expired",
                statusCode: statusCodes.NOT_AUTHORIZED,
            });
    }
    if (!res.locals.skipResponse)
        return genericResponse({
            res,
            result: null,
            exception: null,
            pagination: null,
            statusCode: statusCodes.NOT_AUTHORIZED,
        });
}
export async function tenantResolver(req, res, next) {
    if (!res.locals.skipResponse) {
        let invalidreq = await validaterequest(req.body);
        if (invalidreq)
            return genericResponse({
                res,
                result: null,
                exception: "Invalid Data",
                pagination: null,
                statusCode: statusCodes.INVALID_DATA,
            });
    }

    const {token} = req.headers;
    const {user, iat} = await getCurrentUser(token);

    if (user) {
        const opts = {
            attributes: {
                include: ["name"],
            },
        };

        const item = await genericGetOne({
            Table: TenantAccount,
            condition: {_id: user.userId},
            opts,
        });

        if (item) {
            updateJWTLastUsed(token, res);
            res.locals.tenantId = item._id;
            res.locals.userType = item.user_role;
            next();
            return true;
        }
    } else {
        if (!res.locals.skipResponse)
            return genericResponse({
                res,
                result: null,
                exception: "Token expired",
                pagination: null,
                stringResult: "Token expired",
                statusCode: statusCodes.NOT_AUTHORIZED,
            });
    }
    if (!res.locals.skipResponse)
        return genericResponse({
            res,
            result: null,
            exception: null,
            pagination: null,
            statusCode: statusCodes.NOT_AUTHORIZED,
        });
}
export async function adminResolver(req, res, next) {
    if (!res.locals.skipResponse) {
        const invalidreq = await validaterequest(req.body);
        if (invalidreq)
            return genericResponse({
                res,
                result: null,
                exception: "Invalid Data",
                pagination: null,
                statusCode: statusCodes.INVALID_DATA,
            });
    }

    const {token} = req.headers;
    const {user} = await getCurrentUser(token);

    if (user) {
        const opts = {
            attributes: {include: []},
        };

        const item = await genericGetOne({
            Table: BillingUsers,
            condition: {_id: user.userId},
            populateQuery: ["roleItems", "organisationItems", "branchItems"],
            opts,
        });

        if (item) {
            const adminRoles = [
                "Admin",
                "OrganisationAdmin",
                "BranchAdmin",
                "Manager",
            ];

            // ✅ Check if the user has permission
            if (!adminRoles.includes(item.roleItems?.name)) {
                return genericResponse({
                    res,
                    result: null,
                    exception:
                        "You do not have permission to perform this action",
                    statusCode: statusCodes.NOT_AUTHORIZED,
                });
            }

            updateJWTLastUsed(token, res);
            res.locals.UserID = item._id;
            res.locals.usertype = item.roleItems?.name;
            res.locals.roleId = item.roleItems?._id;
            res.locals.tenantId = item.tenant_id;
            res.locals.organisationId = item.organisation_id;
            res.locals.branchId = item.branch_id;
            next();
            return true;
        }

        if (!item && !res.locals.skipResponse) {
            return genericResponse({
                res,
                result: null,
                exception: "Token expired",
                pagination: null,
                stringResult: "Token expired",
                statusCode: statusCodes.NOT_AUTHORIZED,
            });
        }
    }

    if (!res.locals.skipResponse) {
        return genericResponse({
            res,
            result: null,
            exception: null,
            pagination: null,
            statusCode: statusCodes.NOT_AUTHORIZED,
        });
    }
}

export async function superadminResolver(req, res, next) {
    if (!res.locals.skipResponse) {
        let invalidreq = await validaterequest(req.body);
        if (invalidreq)
            return genericResponse({
                res,
                result: null,
                exception: "Invalid Data",
                pagination: null,
                statusCode: statusCodes.INVALID_DATA,
            });
    }
    const {token} = req.headers;
    const {user, iat} = await getCurrentUser(token);

    if (user) {
        const opts = {
            attributes: {include: []},
        };

        const item = await genericGetOne({
            Table: Users,
            condition: {_id: user?.userId},
            opts,
        });
        if (item) {
            updateJWTLastUsed(token, res);
            res.locals.UserID = item._id;
            res.locals.userType = item.usertype;
            next();
            return true;
        }
        if (!item) {
            if (!res.locals.skipResponse)
                return genericResponse({
                    res,
                    result: null,
                    exception: "Token expired",
                    pagination: null,
                    stringResult: "Token expired",
                    statusCode: statusCodes.NOT_AUTHORIZED,
                });
        }
    }
    if (!res.locals.skipResponse)
        return genericResponse({
            res,
            result: null,
            exception: null,
            pagination: null,
            statusCode: statusCodes.NOT_AUTHORIZED,
        });
}
export function multiAuth(middlewares) {
    return async function (req, res, next) {
        let invalidreq = await validaterequest(req.body);
        if (invalidreq) {
            return genericResponse({
                res,
                result: null,
                exception: "Invalid Data",
                pagination: null,
                statusCode: statusCodes.INVALID_DATA,
            });
        }
        let middleResponse = false;
        for (let index = 0; index < middlewares.length; index++) {
            const auth = middlewares[index];
            if (index < middlewares.length - 1)
                res.locals = {...res.locals, skipResponse: true};
            else {
                res.locals = {...res.locals, skipResponse: false};
            }
            middleResponse = await auth(req, res, next);
            if (middleResponse) {
                break;
            }
        }
    };
}

export function checkAllAuth() {
    return async function (req, res, next) {
        let invalidreq = await validaterequest(req.body);
        if (invalidreq) {
            return genericResponse({
                res,
                result: null,
                exception: "Invalid Data",
                pagination: null,
                statusCode: statusCodes.INVALID_DATA,
            });
        }

        let middleResponse = false;
        let middlewares = [
            userResolver,
            tenantResolver,
            adminResolver,
            superadminResolver,
        ];
        for (let index = 0; index < middlewares.length; index++) {
            const auth = middlewares[index];
            if (index < middlewares.length - 1)
                res.locals = {...res.locals, skipResponse: true};
            else {
                res.locals = {...res.locals, skipResponse: false};
            }
            middleResponse = await auth(req, res, next);
            if (middleResponse) {
                break;
            }
        }
    };
}

export async function checkAccessRights({req, roleId}) {
    if (!roleId) return false;
    const url = req.originalUrl?.split("/")[1];
    const {method} = req;

    if (url && method) {
        if (url.includes("flow")) return false;
        // if (ismainmodule) {
        //     const accessRight = await genericGetOne({
        //         Table: RoleAccessRight,
        //         condition: {Role: roleId, ToDate: null},
        //         populateQuery: [
        //             {
        //                 model: AccessRight,
        //                 as: "AccessRightItem",
        //                 where: {
        //                     Access: AccessRightMethods[`${method}`],
        //                     Path: url,
        //                 },
        //             },
        //         ],
        //     });
        //     if (accessRight) return true;
        //     return false;
        // }
    }
    return true;
}

export async function logout(req, res) {
    const {token} = req.headers;
    const {user} = await getCurrentUser(token);
    if (user) {
        const jwtAccessItem = await genericGetOne({
            Table: JWTAccess,
            condition: {JWT: token, User: user?._id?.toString()},
        });

        if (jwtAccessItem) {
            await consumeJWT(token);
            let logJson = {
                Username: user?.MobileNumber,
                Ip: getClientIp(req),
                Status: "success",
                Type: "logout",
                LogOutOn: getUtcUnix(),
            };
            logJson[`${user?.UserPath}`] = user._id;
            return genericResponse({
                res,
                result: null,
                exception: null,
                pagination: null,
                statusCode: statusCodes.SUCCESS,
            });
        }
    }
    let logJson = {
        Username: user?.MobileNumber,
        Ip: getClientIp(req),
        Status: "failed",
        Type: "logout",
        LogOutOn: getUtcUnix(),
    };
    logJson[`${user?.UserPath}`] = user?._id;
    // createLoginLog(logJson);
    return genericResponse({
        res,
        result: null,
        exception: null,
        pagination: null,
        statusCode: statusCodes.NOT_AUTHORIZED,
    });
}

async function validaterequest(obj) {
    let error = "";
    if (!obj) return error;
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === "string") {
            let invalidChar = "";
            const isInvalid = INVALID_CHARS.some(char => {
                if (obj[key].includes(char)) {
                    invalidChar += `${char} `;
                    return true;
                }
                return false;
            });
            const isException = FIELD_EXCEPTIONS.some(field => key === field);
            if (isInvalid && !isException) {
                error = `${key} contains one or more invalid characters: '${invalidChar}'`;
            }
        }
    });
    return error;
}

export const INVALID_CHARS = [`alert(`, `<script`, `prompt(`, `confirm(`];

const FIELD_EXCEPTIONS = ["Password", "OldPassword", "NewPassword"];
