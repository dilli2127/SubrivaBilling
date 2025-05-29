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
    key: "invoices",
    label: "Invoices",
    icon: <FileTextOutlined />,
    children: [
      {
        key: "create-invoice",
        label: "Create Invoice",
        icon: <PlusCircleOutlined />,
        path: "/invoices/create",
      },
      {
        key: "all-invoices",
        label: "All Invoices",
        icon: <UnorderedListOutlined />,
        path: "/invoices",
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
        path: "/customers/add",
      },
      {
        key: "all-customers",
        label: "All Customers",
        icon: <TeamOutlined />,
        path: "/customers",
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
        label: "Add Product",
        icon: <PlusCircleOutlined />,
        path: "/products/add",
      },
      {
        key: "all-products",
        label: "All Products",
        icon: <DatabaseOutlined />,
        path: "/products",
      },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    icon: <DollarCircleOutlined />,
    path: "/payments",
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
