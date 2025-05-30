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
    key: "Retail Bills",
    label: "Retail Bills",
    icon: <FileTextOutlined />,
    children: [
      {
        key: "create-retail-bill",
        label: "Retail Bill",
        icon: <PlusCircleOutlined />,
        path: "/retaill_billing",
      },
      {
        key: "all-retail-bills",
        label: "Retail Bills List",
        icon: <UnorderedListOutlined />,
        path: "/retaill_bill_list",
      },
    ],
  },
  {
    key: "invoices",
    label: "Invoices",
    icon: <FileTextOutlined />,
    children: [
      {
        key: "invoice_create",
        label: "Invoice Create",
        icon: <PlusCircleOutlined />,
        path: "/invoice_create",
      },
      {
        key: "all-invoices",
        label: "All Invoices",
        icon: <UnorderedListOutlined />,
        path: "/invoice_list",
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
        label: "Add Customer",
        icon: <UserAddOutlined />,
        path: "/customer_crud",
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
        label: "expenses",
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
        label: "Sales Report",
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
