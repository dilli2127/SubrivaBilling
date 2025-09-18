import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Users from "../models/users.js";
import {genericGetOne} from "./generic_controller.js";
import {genericResponse} from "./base_controllers.js";
import {statusCodes, jwtExpirationTime} from "../config/constants.js";
import {createJWT} from "./jwt_access_controller.js";
import {secretKey} from "../config/environment.js";
import BillingUsers from "../models/billing_users.js";
const populateQuery = ["roleItems","organisationItems", "branchItems"];
export async function BillingLoginAuth(req, res, next) {
    const {username, password} = req.body;
    const user_name = username;
    try {
        if (!user_name || !password) {
            return res
                .status(400)
                .json({message: "Username and password are required."});
        }

        const user = await genericGetOne({
            Table: BillingUsers,
            condition: {user_name},
            populateQuery,
            next,
        });

        if (!user) {
            return res
                .status(401)
                .json({message: "Invalid username or password."});
        }

        if (!user.password) {
            return res.status(500).json({
                message: "Password not found for user. Check database.",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({message: "Invalid username or password."});
        }

        const tokenPayload = {
            userId: user._id,
            username: user.user_name,
            usertype : user.roleItems?.name,
            role_id: user.role_id,
            branch_id: user.branch_id,
            organisation_id: user.organisation_id,
            tenantId: user.tenant_id,
        };

        const token = jwt.sign({user: tokenPayload}, secretKey, {
            expiresIn: jwtExpirationTime.seconds,
        });

        if (token) await createJWT(token, jwtExpirationTime.seconds, user._id);
        const userresult = user.toJSON();
        delete userresult.password;
        delete userresult._id;
        return genericResponse({
            res,
            result: {token, UserItem: userresult},
            exception: null,
            pagination: null,
            statusCode: statusCodes.SUCCESS,
        });
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}
