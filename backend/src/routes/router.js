import express from "express";
import * as LoginAuth from "../controllers/login_auth.js";
import * as BillingLoginAuth from "../controllers/billing_login_auth.js";
import * as TenantLoginAuth from "../controllers/tenant_login_auth.js";
import multer from "multer";
import * as uploadfilecontroller from "../controllers/upload_file_controller.js";
import {
    adminResolver,
    checkAllAuth,
    multiAuth,
    superadminResolver,
    tenantResolver,
    userResolver,
} from "../config/auth.js";

import * as unitController from "../controllers/unit_controller.js";
import * as variantController from "../controllers/variant_controller.js";
import * as categoryController from "../controllers/category_controller.js";
import * as productsController from "../controllers/products_controller.js";
import * as vendorController from "../controllers/vendor_controller.js";
import * as warehouseController from "../controllers/warehouse_controller.js";
import * as stockauditController from "../controllers/stock_audit_controller.js";
import * as salesRecordController from "../controllers/sales_record_controller.js";
import * as salesRecordItemsController from "../controllers/sales_records_items_controller.js";
import * as paymentHistoryController from "../controllers/payment_history_controller.js";
import * as expensesController from "../controllers/expenses_controller.js";
import * as dashBoardController from "../controllers/dashboardController.js";
import * as stockOutController from "../controllers/stock_out_controller.js";
import * as invoiceNumbersController from "../controllers/invoice_numbers_controller.js";
import * as UserRegister from "../controllers/user_controller.js";
import * as organisationsController from "../controllers/organisations_controller.js";
import * as branchesController from "../controllers/branches_controller.js";
import * as rolesController from "../controllers/roles_controller.js";
import * as billingUsersController from "../controllers/billing_users_controller.js";
import * as tenantAccountsController from "../controllers/tenant_accounts_controller.js";
import * as branchStockController from "../controllers/branch_stock_controller.js";
import * as rackController from "../controllers/rack_controller.js";
import * as stockStroageController from "../controllers/stock_storage_controller.js";
//IMPORT
import * as CustomerController from "../controllers/customer_controller.js";

export default function exportedRouter() {
    const options = {
        caseSensitive: true,
    };
    const router = express.Router(options);

    router.get("/", (req, res) => {
        res.send("Hello World!");
    });

    // Health check endpoint for Electron app
    router.get("/health", (req, res) => {
        res.status(200).json({
            status: "OK",
            message: "SubrivaBilling Backend is running",
            timestamp: new Date().toISOString(),
            environment: process.env.ENVIRONMENT || "development"
        });
    });
    router.get("/favicon.ico", (req, res) => {
        res.send(null);
    });

    router.post("/login", LoginAuth.LoginAuth);
    router.post("/billing_login", BillingLoginAuth.BillingLoginAuth);
    router.post("/tentant_login", TenantLoginAuth.TenantLoginAuth);
    router.post("/signup", UserRegister.RegisterUser);
    //dashboard
    router.post(
        "/dashboard/stats",
        checkAllAuth(),
        dashBoardController.getDashboardStats,
    );
    router.post(
        "/dashboard/sales_chart",
        checkAllAuth(),
        dashBoardController.getSalesChartData,
    );
    router.post(
        "/dashboard/purchased_chart",
        checkAllAuth(),
        dashBoardController.getWeeklyPurchaseData,
    );
    router.post(
        "/dashboard/getStockAlerts",
        checkAllAuth(),
        dashBoardController.getGroupedStockAlerts,
    );

    //unit
    router.put(
        "/unit",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        unitController.create,
    );
    router.post("/unit", checkAllAuth(), unitController.getAll);
    router.get("/unit/:_id", checkAllAuth(), unitController.getOne);
    router.get("/unit", unitController.getAllWithoutPagination);
    router.patch(
        "/unit/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        unitController.update,
    );
    router.delete(
        "/unit/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        unitController.remove,
    );

    //variant
    router.put(
        "/variant",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        variantController.create,
    );
    router.post("/variant", checkAllAuth(), variantController.getAll);
    router.get("/variant/:_id", checkAllAuth(), variantController.getOne);
    router.get(
        "/variant",
        checkAllAuth(),
        variantController.getAllWithoutPagination,
    );
    router.patch(
        "/variant/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        variantController.update,
    );
    router.delete(
        "/variant/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        variantController.remove,
    );

    //category
    router.put(
        "/category",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        categoryController.create,
    );
    router.post("/category", checkAllAuth(), categoryController.getAll);
    router.get("/category/:_id", checkAllAuth(), categoryController.getOne);
    router.get(
        "/category",
        checkAllAuth(),
        categoryController.getAllWithoutPagination,
    );
    router.patch(
        "/category/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        categoryController.update,
    );
    router.delete(
        "/category/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        categoryController.remove,
    );

    //products
    router.put(
        "/products",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        productsController.create,
    );
    router.post("/products", checkAllAuth(), productsController.getAll);
    router.get("/products/:_id", checkAllAuth(), productsController.getOne);
    router.get(
        "/products",
        checkAllAuth(),
        productsController.getAllWithoutPagination,
    );
    router.patch(
        "/products/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        productsController.update,
    );
    router.delete(
        "/products/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        productsController.remove,
    );

    //vendor
    router.put(
        "/vendor",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        vendorController.create,
    );
    router.post("/vendor", checkAllAuth(), vendorController.getAll);
    router.get("/vendor/:_id", checkAllAuth(), vendorController.getOne);
    router.get(
        "/vendor",
        checkAllAuth(),
        vendorController.getAllWithoutPagination,
    );
    router.patch(
        "/vendor/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        vendorController.update,
    );
    router.delete(
        "/vendor/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        vendorController.remove,
    );

    //warehouse
    router.put(
        "/warehouse",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        warehouseController.create,
    );
    router.post("/warehouse", checkAllAuth(), warehouseController.getAll);
    router.get("/warehouse/:_id", checkAllAuth(), warehouseController.getOne);
    router.get(
        "/warehouse",
        checkAllAuth(),
        warehouseController.getAllWithoutPagination,
    );
    router.patch(
        "/warehouse/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        warehouseController.update,
    );
    router.delete(
        "/warehouse/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        warehouseController.remove,
    );

    //stockaudit
    router.post(
        "/product_stocks",
        checkAllAuth(),
        stockauditController.getAllProdcutStocks,
    );
    router.put(
        "/stock_audit",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockauditController.create,
    );
    router.post("/stock_audit", checkAllAuth(), stockauditController.getAll);
    router.get(
        "/stock_audit/:_id",
        checkAllAuth(),
        stockauditController.getOne,
    );
    router.get(
        "/stock_audit",
        checkAllAuth(),
        stockauditController.getAllWithoutPagination,
    );
    router.patch(
        "/stock_audit/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockauditController.update,
    );
    router.delete(
        "/stock_audit/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockauditController.remove,
    );

    //salesRecord
    router.put("/sales_record", checkAllAuth(), salesRecordController.create);
    router.post("/sales_record", checkAllAuth(), salesRecordController.getAll);
    router.get(
        "/sales_record/:_id",
        checkAllAuth(),
        salesRecordController.getOne,
    );
    router.get(
        "/sales_record",
        checkAllAuth(),
        salesRecordController.getAllWithoutPagination,
    );
    router.patch(
        "/sales_record/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        salesRecordController.update,
    );
    router.delete(
        "/sales_record/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        salesRecordController.remove,
    );

    //salesrecordItems
    router.put(
        "/sales_records_items",
        checkAllAuth(),
        salesRecordItemsController.create,
    );
    router.post(
        "/sales_records_items",
        checkAllAuth(),
        salesRecordItemsController.getAll,
    );
    router.get(
        "/sales_records_items/:_id",
        checkAllAuth(),
        salesRecordItemsController.getOne,
    );
    router.get(
        "/sales_records_items",
        checkAllAuth(),
        salesRecordItemsController.getAllWithoutPagination,
    );
    router.patch(
        "/sales_records_items/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        salesRecordItemsController.update,
    );
    router.delete(
        "/sales_records_items/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        salesRecordItemsController.remove,
    );

    //paymentHistory
    router.put(
        "/payment_history",
        checkAllAuth(),
        paymentHistoryController.create,
    );
    router.post(
        "/payment_history",
        checkAllAuth(),
        paymentHistoryController.getAll,
    );
    router.get(
        "/payment_history/:_id",
        checkAllAuth(),
        paymentHistoryController.getOne,
    );
    router.get(
        "/payment_history",
        checkAllAuth(),
        paymentHistoryController.getAllWithoutPagination,
    );
    router.patch(
        "/payment_history/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        paymentHistoryController.update,
    );
    router.delete(
        "/payment_history/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        paymentHistoryController.remove,
    );

    //expenses
    router.put("/expenses", checkAllAuth(), expensesController.create);
    router.post("/expenses", checkAllAuth(), expensesController.getAll);
    router.get("/expenses/:_id", checkAllAuth(), expensesController.getOne);
    router.get(
        "/expenses",
        checkAllAuth(),
        expensesController.getAllWithoutPagination,
    );
    router.patch(
        "/expenses/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        expensesController.update,
    );
    router.delete(
        "/expenses/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        expensesController.remove,
    );

    //stockOut
    router.put(
        "/stock_out",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockOutController.create,
    );
    router.post(
        "/stock_out",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockOutController.getAll,
    );
    router.get(
        "/stock_out/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockOutController.getOne,
    );
    router.get(
        "/stock_out",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockOutController.getAllWithoutPagination,
    );
    router.patch(
        "/stock_out/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockOutController.update,
    );
    router.delete(
        "/stock_out/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockOutController.remove,
    );

    //invoiceNumbers
    router.put(
        "/invoice_numbers",
        checkAllAuth(),
        invoiceNumbersController.createInvoiceNumber,
    );
    router.post(
        "/invoice_numbers",
        checkAllAuth(),
        invoiceNumbersController.getLastInvoiceNumber,
    );
    router.get(
        "/invoice_numbers/:_id",
        checkAllAuth(),
        invoiceNumbersController.getOne,
    );
    router.get(
        "/invoice_numbers",
        checkAllAuth(),
        invoiceNumbersController.getAllWithoutPagination,
    );
    router.patch(
        "/invoice_numbers/:_id",
        checkAllAuth(),
        invoiceNumbersController.update,
    );
    router.delete(
        "/invoice_numbers/:_id",
        checkAllAuth(),
        invoiceNumbersController.remove,
    );

    //organisations
    router.put(
        "/organisations",
        multiAuth([superadminResolver, tenantResolver]),
        organisationsController.create,
    );
    router.post(
        "/organisations",
        checkAllAuth(),
        organisationsController.getAll,
    );
    router.get(
        "/organisations/:_id",
        checkAllAuth(),
        organisationsController.getOne,
    );
    router.get(
        "/organisations",
        checkAllAuth(),
        organisationsController.getAllWithoutPagination,
    );
    router.patch(
        "/organisations/:_id",
        multiAuth([superadminResolver, tenantResolver]),
        organisationsController.update,
    );
    router.delete(
        "/organisations/:_id",
        multiAuth([superadminResolver, tenantResolver]),
        organisationsController.remove,
    );

    //branches
    router.put(
        "/branches",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        branchesController.create,
    );
    router.post("/branches", checkAllAuth(), branchesController.getAll);
    router.get("/branches/:_id", checkAllAuth(), branchesController.getOne);
    router.get(
        "/branches",
        checkAllAuth(),
        branchesController.getAllWithoutPagination,
    );
    router.patch(
        "/branches/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        branchesController.update,
    );
    router.delete(
        "/branches/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        branchesController.remove,
    );

    //roles
    router.put(
        "/roles",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        rolesController.create,
    );
    router.post("/roles", checkAllAuth(), rolesController.getAll);
    router.get("/roles/:_id", checkAllAuth(), rolesController.getOne);
    router.get(
        "/roles",
        checkAllAuth(),
        rolesController.getAllWithoutPagination,
    );
    router.patch(
        "/roles/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        rolesController.update,
    );
    router.delete(
        "/roles/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        rolesController.remove,
    );

    //billingUsers
    router.put(
        "/billing_users",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        billingUsersController.create,
    );
    router.post(
        "/billing_users",
        checkAllAuth(),
        billingUsersController.getAll,
    );
    router.get(
        "/billing_users/:_id",
        checkAllAuth(),
        billingUsersController.getOne,
    );
    router.get(
        "/billing_users",
        checkAllAuth(),
        billingUsersController.getAllWithoutPagination,
    );
    router.patch(
        "/billing_users/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        billingUsersController.update,
    );
    router.delete(
        "/billing_users/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        billingUsersController.remove,
    );

    //tenantAccounts
    router.put(
        "/tenant_accounts",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        tenantAccountsController.create,
    );
    router.post(
        "/tenant_accounts",
        checkAllAuth(),
        tenantAccountsController.getAll,
    );
    router.get(
        "/tenant_accounts/:_id",
        checkAllAuth(),
        tenantAccountsController.getOne,
    );
    router.get(
        "/tenant_accounts",
        checkAllAuth(),
        tenantAccountsController.getAllWithoutPagination,
    );
    router.patch(
        "/tenant_accounts/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        tenantAccountsController.update,
    );
    router.delete(
        "/tenant_accounts/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        tenantAccountsController.remove,
    );

    //branchStock
    router.post(
        "/product_branch_stocks",
        checkAllAuth(),
        branchStockController.getAllProdcutBranchStocks,
    );
    router.put(
        "/branch_stock",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        branchStockController.create,
    );
    router.post("/branch_stock", checkAllAuth(), branchStockController.getAll);
    router.get(
        "/branch_stock/:_id",
        checkAllAuth(),
        branchStockController.getOne,
    );
    router.get(
        "/branch_stock",
        checkAllAuth(),
        branchStockController.getAllWithoutPagination,
    );
    router.patch(
        "/branch_stock/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        branchStockController.update,
    );
    router.patch(
        "/revert_stock",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        branchStockController.revert,
    );
    router.delete(
        "/branch_stock/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        branchStockController.remove,
    );

    //rack
    router.put(
        "/rack",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        rackController.create,
    );
    router.post("/rack", checkAllAuth(), rackController.getAll);
    router.get("/rack/:_id", checkAllAuth(), rackController.getOne);
    router.get("/rack", rackController.getAllWithoutPagination);
    router.patch(
        "/rack/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        rackController.update,
    );
    router.delete(
        "/rack/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        rackController.remove,
    );

    //stockStroage
    router.put(
        "/stock_storage",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockStroageController.create,
    );
    router.post(
        "/stock_storage",
        checkAllAuth(),
        stockStroageController.getAll,
    );
    router.get(
        "/stock_storage/:_id",
        checkAllAuth(),
        stockStroageController.getOne,
    );
    router.get(
        "/stock_storage",
        checkAllAuth(),
        stockStroageController.getAllWithoutPagination,
    );
    router.patch(
        "/stock_storage/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockStroageController.update,
    );
    router.delete(
        "/stock_storage/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        stockStroageController.remove,
    );

    //NEW_ROUTE

    // file upload
    router.post(
        "/file-upload",
        multer({
            dest: "./Attachments/Files",
            // eslint-disable-next-line promise/prefer-await-to-callbacks
        }).any(),
        checkAllAuth,
        uploadfilecontroller.filterFiles,
        uploadfilecontroller.uploadFiles,
    );

    router.post(
        "/upload-photo",
        multer({
            dest: "./Attachments/Files",
            // eslint-disable-next-line promise/prefer-await-to-callbacks
        }).any(),
        checkAllAuth,
        uploadfilecontroller.filterFiles,
        uploadfilecontroller.uploadFilesaws,
    );
    //customer
    router.put("/customer", checkAllAuth(), CustomerController.create);
    router.post("/customer", checkAllAuth(), CustomerController.getAll);
    router.get("/customer/:_id", checkAllAuth(), CustomerController.getOne);
    router.get(
        "/customer",
        checkAllAuth(),
        CustomerController.getAllWithoutPagination,
    );
    router.patch("/customer/:_id", checkAllAuth(), CustomerController.update);
    router.delete(
        "/customer/:_id",
        multiAuth([superadminResolver, tenantResolver, adminResolver]),
        CustomerController.remove,
    );

    return router;
}
