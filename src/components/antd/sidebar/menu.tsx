import {
  DashboardOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  UserOutlined,
  UserAddOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  DollarCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";

export const menuItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <DashboardOutlined />,
    path: "/dashboard",
  },
  {
    key: "SalesRecords",
    label: "Sales Records",
    icon: <FileTextOutlined />,
    children: [
      {
        key: "create-sales-record",
        label: "Sales Record",
        icon: <PlusCircleOutlined />,
        path: "/retaill_billing",
      },
      {
        key: "sales-records-list",
        label: "Sales Records List",
        icon: <UnorderedListOutlined />,
        path: "/retaill_bill_list",
      },
    ],
  },

  {
    key: "Stock Audit",
    label: "Stock Audit",
    icon: <FileTextOutlined />,
    children: [
      {
        key: "stock-audit",
        label: "Stock Audit",
        icon: <PlusCircleOutlined />,
        path: "/stock_audit",
      },
       {
        key: "stock-out",
        label: "Stock Out",
        icon: <PlusCircleOutlined />,
        path: "/stock_out",
      },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    icon: <UserOutlined />,
    children: [
      {
        key: "add-customer",
        label: "Customer",
        icon: <UserAddOutlined />,
        path: "/customer_crud",
      },
      {
        key: "vendor",
        label: "Vendor",
        icon: <TeamOutlined />,
        path: "/vendor_crud",
      },
    ],
  },
  {
    key: "products",
    label: "Products",
    icon: <ShoppingCartOutlined />,
    children: [
      {
        key: "add-product",
        label: "Product",
        icon: <PlusCircleOutlined />,
        path: "/prduct_crud",
      },
      {
        key: "unit",
        label: "Unit",
        icon: <DatabaseOutlined />,
        path: "/unit_crud",
      },
      {
        key: "category",
        label: "Category",
        icon: <DatabaseOutlined />,
        path: "/category_crud",
      },
      {
        key: "variant",
        label: "Variant",
        icon: <DatabaseOutlined />,
        path: "/variant_crud",
      },
      {
        key: "warehouse",
        label: "Warehouse",
        icon: <DatabaseOutlined />,
        path: "/warehouse_crud",
      },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    icon: <DollarCircleOutlined />,
    children: [
      {
        key: "payment-history",
        label: "Payment History",
        icon: <LineChartOutlined />,
        path: "payment_history",
      },
      {
        key: " expenses",
        label: "Expenses",
        icon: <PieChartOutlined />,
        path: "/expenses",
      },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    icon: <BarChartOutlined />,
    children: [
      {
        key: "sales-report",
        label: "Sale Report",
        icon: <LineChartOutlined />,
        path: "/reports/sales",
      },
      {
        key: "customer-report",
        label: "Customer Report",
        icon: <PieChartOutlined />,
        path: "/reports/customers",
      },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: <SettingOutlined />,
    path: "/settings",
  },
];
