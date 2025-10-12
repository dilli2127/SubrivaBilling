import React, { Suspense, lazy } from "react";
import { RouteConfig } from "./types/routeConfig";
import Sidebar from "../components/antd/sidebar/sidebar";
import { Outlet } from "react-router-dom";
import Login from "../pages/login/login";
import Signup from "../pages/login/Signup";
import ForgotPassword from "../pages/login/ForgotPassword";
import TenantSignup from "../pages/TenantSignup/TenantSignup";
import Dashboard from "../pages/Dashboard";
import Loader from "../components/common/Loader";
import BillingLogin from "../pages/login/billing_login";
import BranchStock from "../pages/BranchStock/crud";
import LandingPage from "../pages/LandingPage/LandingPage";
import FeaturesPage from "../pages/LandingPage/FeaturesPage";
import PricingPage from "../pages/LandingPage/PricingPage";
import CustomersPage from "../pages/LandingPage/CustomersPage";
import ContactUsPage from "../pages/LandingPage/ContactUsPage";
import LandingPageLayout from "../components/common/LandingPageLayout";
const ProductCrud = lazy(() => import("../pages/Products/crud"));
const UnitCrud = lazy(() => import("../pages/Unit/crud"));
const CategoryCrud = lazy(() => import("../pages/Category/crud"));
const VariantCrud = lazy(() => import("../pages/Variant/crud"));
const BillingPage = lazy(() => import("../pages/RetaillBill/BillingPage"));
const BillListPage = lazy(() => import("../pages/RetaillBill/BillListPage"));
const CustomerCrud = lazy(() => import("../pages/Customer/crud"));
const PaymentHistory = lazy(() => import("../pages/Payment/PaymentHistory"));
const ExpensesPage = lazy(() => import("../pages/Payment/ExpensesPage"));
const StockAudit = lazy(() => import("../pages/StockAudit/crud"));
const VendorCrud = lazy(() => import("../pages/Vendor/crud"));
const Warehouse = lazy(() => import("../pages/Warehouse/crud"));
const RackCrud = lazy(() => import("../pages/Rack/crud"));
const StockOutCrud = lazy(() => import("../pages/StockOut/crud"));
const StockAvailable = lazy(() => import("../pages/ProductStocks/List"));
const OrganisationsCrud = lazy(() => import("../pages/Organisations/crud"));
const BrachesCrud = lazy(() => import("../pages/Branches/crud"));
const SalesAccountCrud = lazy(() => import("../pages/UserAccount/crud"));
const RolesCrud = lazy(() => import("../pages/Roles/crud"));
const TenantAccount = lazy(() => import("../pages/TentantAccount/crud"));
const BranchStockAvailable = lazy(() => import("../pages/BranchProductStocks/List"));
const StorageStockList = lazy(() => import("../pages/StockAudit/StorageStockList"));
const Reports = lazy(() => import("../pages/Reports/index"));
const UserProfile = lazy(() => import("../pages/UserProfile"));
const Settings = lazy(() => import("../pages/Settings"));

// Dynamic Entity System
const EntityDefinitionsCrud = lazy(() => import("../pages/EntityDefinitions/crud"));
const EntityExplorer = lazy(() => import("../pages/DynamicEntity/EntityExplorer"));
const DynamicEntityCrud = lazy(() => import("../pages/DynamicEntity/DynamicEntityCrud"));


const routerData: RouteConfig[] = [
  {
    key: "landing",
    path: "/",
    element: (
      <Suspense fallback={<Loader />}>
        <LandingPageLayout>
          <LandingPage />
        </LandingPageLayout>
      </Suspense>
    ),
    children: [],
  },
  {
    key: "login",
    path: "/login",
    element: (
      <Suspense fallback={<Loader />}>
        <Login />
      </Suspense>
    ),
    children: [],
  },
  {
    key: "features",
    path: "/features",
    element: (
      <Suspense fallback={<Loader />}>
        <LandingPageLayout>
          <FeaturesPage />
        </LandingPageLayout>
      </Suspense>
    ),
    children: [],
  },
  {
    key: "pricing",
    path: "/pricing",
    element: (
      <Suspense fallback={<Loader />}>
        <LandingPageLayout>
          <PricingPage />
        </LandingPageLayout>
      </Suspense>
    ),
    children: [],
  },
  {
    key: "customers",
    path: "/customers",
    element: (
      <Suspense fallback={<Loader />}>
        <LandingPageLayout>
          <CustomersPage />
        </LandingPageLayout>
      </Suspense>
    ),
    children: [],
  },
  {
    key: "contact",
    path: "/contact",
    element: (
      <Suspense fallback={<Loader />}>
        <LandingPageLayout>
          <ContactUsPage />
        </LandingPageLayout>
      </Suspense>
    ),
    children: [],
  },
  {
    key: "billing_login",
    path: "/billing_login",
    element: (
      <Suspense fallback={<Loader />}>
        <BillingLogin />
      </Suspense>
    ),
    children: [],
  },
  {
    key: "signup",
    path: "/signup",
    element: (
      <Suspense fallback={<Loader />}>
        <Signup />
      </Suspense>
    ),
    children: [],
  },
  {
    key: "forgot-password",
    path: "/forgot-password",
    element: (
      <Suspense fallback={<Loader />}>
        <ForgotPassword />
      </Suspense>
    ),
    children: [],
  },
  {
    key: "tenant-signup",
    path: "/tenant-signup",
    element: (
      <Suspense fallback={<Loader />}>
        <TenantSignup />
      </Suspense>
    ),
    children: [],
  },

  // Admin Routes
  {
    key: "admin_dashboard",
    path: "/",
    element: (
      <Suspense fallback={<Loader />}>
        <Sidebar>
          <Outlet />
        </Sidebar>
      </Suspense>
    ),
    children: [
      {
        key: "dashboard",
        path: "dashboard",
        element: (
          <Suspense fallback={<Loader />}>
            <Dashboard />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "prduct_crud",
        path: "prduct_crud",
        element: (
          <Suspense fallback={<Loader />}>
            <ProductCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "unit_crud",
        path: "unit_crud",
        element: (
          <Suspense fallback={<Loader />}>
            <UnitCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "category_crud",
        path: "category_crud",
        element: (
          <Suspense fallback={<Loader />}>
            <CategoryCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "variant_crud",
        path: "variant_crud",
        element: (
          <Suspense fallback={<Loader />}>
            <VariantCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "retaill_billing",
        path: "retaill_billing",
        element: (
          <Suspense fallback={<Loader />}>
            <BillingPage />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "retaill_bill_list",
        path: "retaill_bill_list",
        element: (
          <Suspense fallback={<Loader />}>
            <BillListPage />
          </Suspense>
        ),
        children: [],
      },

      {
        key: "customer_crud",
        path: "customer_crud",
        element: (
          <Suspense fallback={<Loader />}>
            <CustomerCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "payment_history",
        path: "payment_history",
        element: (
          <Suspense fallback={<Loader />}>
            <PaymentHistory />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "expenses",
        path: "expenses",
        element: (
          <Suspense fallback={<Loader />}>
            <ExpensesPage />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "stock_audit",
        path: "stock_audit",
        element: (
          <Suspense fallback={<Loader />}>
            <StockAudit />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "stock_available",
        path: "stock_available",
        element: (
          <Suspense fallback={<Loader />}>
            <StockAvailable />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "vendor_crud",
        path: "vendor_crud",
        element: (
          <Suspense fallback={<Loader />}>
            <VendorCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "warehouse_crud",
        path: "warehouse_crud",
        element: (
          <Suspense fallback={<Loader />}>
            <Warehouse />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "rack_crud",
        path: "rack_crud",
        element: (
          <Suspense fallback={<Loader />}>
            <RackCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "stock_out",
        path: "stock_out",
        element: (
          <Suspense fallback={<Loader />}>
            <StockOutCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "organisation",
        path: "organisation",
        element: (
          <Suspense fallback={<Loader />}>
            <OrganisationsCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "branches",
        path: "branches",
        element: (
          <Suspense fallback={<Loader />}>
            <BrachesCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "sales_account",
        path: "users",
        element: (
          <Suspense fallback={<Loader />}>
            <SalesAccountCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "roles",
        path: "roles",
        element: (
          <Suspense fallback={<Loader />}>
            <RolesCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "tenant_account",
        path: "tenant_account",
        element: (
          <Suspense fallback={<Loader />}>
            <TenantAccount />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "branchstock",
        path: "branch_stock",
        element: (
          <Suspense fallback={<Loader />}>
            <BranchStock />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "branch_stock_available",
        path: "branch_stock_available",
        element: (
          <Suspense fallback={<Loader />}>
            <BranchStockAvailable />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "storage_stock_list",
        path: "storage_stock_list",
        element: (
          <Suspense fallback={<Loader />}>
            <StorageStockList />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "reports",
        path: "reports",
        element: (
          <Suspense fallback={<Loader />}>
            <Reports />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "user_profile",
        path: "profile",
        element: (
          <Suspense fallback={<Loader />}>
            <UserProfile />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "settings",
        path: "settings",
        element: (
          <Suspense fallback={<Loader />}>
            <Settings />
          </Suspense>
        ),
        children: [],
      },
      // Dynamic Entity System Routes
      {
        key: "entity_definitions",
        path: "entity-definitions",
        element: (
          <Suspense fallback={<Loader />}>
            <EntityDefinitionsCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "entity_explorer",
        path: "entities",
        element: (
          <Suspense fallback={<Loader />}>
            <EntityExplorer />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "dynamic_entity",
        path: "dynamic-entity/:entityName",
        element: (
          <Suspense fallback={<Loader />}>
            <DynamicEntityCrud />
          </Suspense>
        ),
        children: [],
      },
    ],
  },
];

export default routerData;
