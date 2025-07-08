import Sidebar from '../components/antd/layout/sidebar';
import { Outlet } from 'react-router-dom';
import Login from '../pages/login/login';
import Signup from '../pages/login/Signup';
import Dashboard from '../pages/Dashboard';
import Loader from '../components/common/Loader';
import BillingLogin from '../pages/login/billing_login';
import { lazy } from 'react';
import type { RouteConfig } from './types/routeConfig';
import Layout from '../components/antd/layout';
const ProductCrud = lazy(() => import('../pages/Products/crud'));
const UnitCrud = lazy(() => import('../pages/Unit/crud'));
const CategoryCrud = lazy(() => import('../pages/Category/crud'));
const VariantCrud = lazy(() => import('../pages/Variant/crud'));
const RetailBillForm = lazy(() => import('../pages/RetaillBill/retaill_bill'));
const BillListPage = lazy(() => import('../pages/RetaillBill/BillListPage'));
const CustomerCrud = lazy(() => import('../pages/Customer/crud'));
const PaymentHistory = lazy(() => import('../pages/Payment/PaymentHistory'));
const ExpensesPage = lazy(() => import('../pages/Payment/ExpensesPage'));
const StockAudit = lazy(() => import('../pages/StockAudit/crud'));
const VendorCrud = lazy(() => import('../pages/Vendor/crud'));
const Warehouse = lazy(() => import('../pages/Warehouse/crud'));
const StockOutCrud = lazy(() => import('../pages/StockOut/crud'));
const StockAvailable = lazy(() => import('../pages/ProductStocks/List'));
const OrganisationsCrud = lazy(() => import('../pages/Organisations/crud'));
const BrachesCrud = lazy(() => import('../pages/Branches/crud'));
const SalesAccountCrud = lazy(() => import('../pages/UserAccount/crud'));
const RolesCrud = lazy(() => import('../pages/Roles/crud'));
const TenantAccount = lazy(() => import('../pages/TentantAccount/crud'));

const routerData: RouteConfig[] = [
  {
    key: 'login',
    path: '/login',
    element: <Login />,
    children: [],
  },
  {
    key: 'billing_login',
    path: '/billing_login',
    element: <BillingLogin />,
    children: [],
  },
  {
    key: 'billing_login',
    path: '/',
    element: <BillingLogin />,
    children: [],
  },
  {
    key: 'admin',
    path: '/admin',
    element: <Login />,
    children: [],
  },
  {
    key: 'signup',
    path: '/signup',
    element: <Signup />,
    children: [],
  },

  {
    key: 'admin',
    path: '/admin',
    element: (
      <Layout/>
    ),
    children: [
      {
        key: 'dashboard',
        path: 'dashboard',
        element: <Dashboard />,
        children: [],
      },
      {
        key: 'prduct_crud',
        path: 'prduct_crud',
        element: <ProductCrud />,
        children: [],
      },
      {
        key: 'unit_crud',
        path: 'unit_crud',
        element: <UnitCrud />,
        children: [],
      },
      {
        key: 'category_crud',
        path: 'category_crud',
        element: <CategoryCrud />,
        children: [],
      },
      {
        key: 'variant_crud',
        path: 'variant_crud',
        element: <VariantCrud />,
        children: [],
      },
      {
        key: 'retaill_billing',
        path: 'retaill_billing',
        element: <RetailBillForm billdata={''} />,
        children: [],
      },
      {
        key: 'retaill_bill_list',
        path: 'retaill_bill_list',
        element: <BillListPage />,
        children: [],
      },

      {
        key: 'customer_crud',
        path: 'customer_crud',
        element: <CustomerCrud />,
        children: [],
      },
      {
        key: 'payment_history',
        path: 'payment_history',
        element: <PaymentHistory />,
        children: [],
      },
      {
        key: 'expenses',
        path: 'expenses',
        element: <ExpensesPage />,
        children: [],
      },
      {
        key: 'stock_audit',
        path: 'stock_audit',
        element: <StockAudit />,
        children: [],
      },
      {
        key: 'stock_available',
        path: 'stock_available',
        element: <StockAvailable />,
        children: [],
      },
      {
        key: 'vendor_crud',
        path: 'vendor_crud',
        element: <VendorCrud />,
        children: [],
      },
      {
        key: 'warehouse_crud',
        path: 'warehouse_crud',
        element: <Warehouse />,
        children: [],
      },
      {
        key: 'stock_out',
        path: 'stock_out',
        element: <StockOutCrud />,
        children: [],
      },
      {
        key: 'organisation',
        path: 'organisation',
        element: <OrganisationsCrud />,
        children: [],
      },
      {
        key: 'branches',
        path: 'branches',
        element: <BrachesCrud />,
        children: [],
      },
      {
        key: 'sales_account',
        path: 'users',
        element: <SalesAccountCrud />,
        children: [],
      },
      {
        key: 'roles',
        path: 'roles',
        element: <RolesCrud />,
        children: [],
      },
      {
        key: 'tenant_account',
        path: 'tenant_account',
        element: <TenantAccount />,
        children: [],
      },
    ],
  },
];

export default routerData;
