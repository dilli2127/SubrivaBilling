import React, { Suspense, lazy } from "react";
import { RouteConfig } from "./types/routeConfig";
import Sidebar from "../components/antd/sidebar/sidebar";
import { Outlet } from "react-router-dom";
import Login from "../pages/login/login";
import Signup from "../pages/login/Signup";
import Dashboard from "../pages/Dashboard";
const ProductCrud = lazy(() => import("../pages/Products/crud"));
const UnitCrud = lazy(() => import("../pages/Unit/crud"));
const CategoryCrud = lazy(() => import("../pages/Category/crud"));
const VariantCrud = lazy(() => import("../pages/Variant/crud"));
const RetailBillForm = lazy(() => import("../pages/RetaillBill/retaill_bill"));
const BillListPage = lazy(() => import("../pages/RetaillBill/BillListPage"));
const InvoiceCreatePage = lazy(() => import("../pages/Invoice/InvoiceCreatePage"));
const InvoiceListPage = lazy(() => import("../pages/Invoice/InvoiceListPage"));
const CustomerCrud = lazy(() => import("../pages/Customer/crud"));
const PaymentHistory = lazy(() => import("../pages/Payment/PaymentHistory"));
const ExpensesPage = lazy(() => import("../pages/Payment/ExpensesPage"));

const Loader = () => <div>Loading...</div>;

const routerData: RouteConfig[] = [
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
    key: "admin",
    path: "/admin",
    element: (
      <Suspense fallback={<Loader />}>
        <Login />
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

  // Admin Routes
  {
    key: "admin",
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
            <RetailBillForm />
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
        key: "invoice_create",
        path: "invoice_create",
        element: (
          <Suspense fallback={<Loader />}>
            <InvoiceCreatePage />
          </Suspense>
        ),
        children: [],
      },
     {
        key: "invoice_list",
        path: "invoice_list",
        element: (
          <Suspense fallback={<Loader />}>
            <InvoiceListPage />
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
            <PaymentHistory customerId="" />
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
    ],
  },
];

export default routerData;
