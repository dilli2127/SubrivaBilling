import React, { useMemo } from 'react';
import {
  DashboardOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  DollarCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  SettingOutlined,
  HomeOutlined,
  ContainerOutlined,
  AppstoreAddOutlined,
  FolderOpenOutlined,
  IdcardOutlined,
  SolutionOutlined,
  FileSearchOutlined,
  BankOutlined,
  MinusCircleOutlined,
  LineHeightOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  InboxOutlined,
  UndoOutlined,
  CreditCardOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import {
  getPermissions,
  isSuperAdmin,
  getMenuKeys,
} from '../../../helpers/permissionHelper';

// Cache for filtered menu items to avoid recalculation on every render
let cachedFilteredItems: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Function to filter menu items based on permissions
export const getFilteredMenuItems = () => {
  try {
    const now = Date.now();

    // Return cached result if still valid
    if (cachedFilteredItems && now - cacheTimestamp < CACHE_DURATION) {
      return cachedFilteredItems;
    }

    // SuperAdmin can see all menus without restrictions
    const isSuper = isSuperAdmin();

    if (isSuper) {
      cachedFilteredItems = menuItems;
      cacheTimestamp = now;
      return cachedFilteredItems;
    }

    // Try new API structure first (allowedMenuKeys array from login response)
    const menuKeys = getMenuKeys();

    let allowedKeys: Set<string> | string[] | null = null;

    if (menuKeys && menuKeys.length > 0) {
      allowedKeys = menuKeys;
    } else {
      // Fallback to old structure (permissions with allowed_menu_keys)
      const permissions = getPermissions();

      // If no permissions found, show nothing
      if (!permissions || Object.keys(permissions).length === 0) {
        cachedFilteredItems = [];
        cacheTimestamp = now;
        return cachedFilteredItems;
      }

      // Get all allowed menu keys from permissions
      const allowedMenuKeys = new Set<string>();
      Object.values(permissions).forEach((perm: any) => {
        if (perm.allowed_menu_keys && Array.isArray(perm.allowed_menu_keys)) {
          perm.allowed_menu_keys.forEach((key: string) =>
            allowedMenuKeys.add(key)
          );
        }
      });

      // If no allowed menu keys, show nothing
      if (allowedMenuKeys.size === 0) {
        cachedFilteredItems = [];
        cacheTimestamp = now;
        return cachedFilteredItems;
      }

      allowedKeys = allowedMenuKeys;
    }

    const filteredItems = menuItems
      .map(item => {
        // If item has children, filter them based on allowed keys
        if (item.children) {
          const filteredChildren = item.children.filter(child => {
            return Array.isArray(allowedKeys)
              ? allowedKeys.includes(child.key)
              : allowedKeys.has(child.key);
          });

          // Only show parent if it has visible children
          return filteredChildren.length > 0
            ? { ...item, children: filteredChildren }
            : null;
        }

        // For single menu items, check if allowed
        const isAllowed = Array.isArray(allowedKeys)
          ? allowedKeys.includes(item.key)
          : allowedKeys.has(item.key);

        return isAllowed ? item : null;
      })
      .filter(Boolean);

    cachedFilteredItems = filteredItems;
    cacheTimestamp = now;
    return cachedFilteredItems;
  } catch (error) {
    console.error('Error filtering menu items:', error);
    // Show nothing if there's an error
    cachedFilteredItems = [];
    cacheTimestamp = Date.now();
    return cachedFilteredItems;
  }
};

// Hook to use filtered menu items with memoization
export const useFilteredMenuItems = () => {
  return useMemo(() => getFilteredMenuItems(), []);
};

export const menuItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardOutlined />,
    path: '/dashboard',
  },
  {
    key: 'SalesRecords',
    label: 'Sales Records',
    icon: <FileTextOutlined />,
    children: [
      {
        key: 'create-sales-record',
        label: 'Sales Record',
        icon: <AppstoreAddOutlined />,
        path: '/retaill_billing',
      },
      {
        key: 'sales-records-list',
        label: 'Sales Records List',
        icon: <FileSearchOutlined />,
        path: '/retaill_bill_list',
      },
      {
        key: 'quotations',
        label: 'Quotations',
        icon: <FileTextOutlined />,
        path: '/quotations',
      },
      {
        key: 'sales-returns-list',
        label: 'Sales Returns',
        icon: <UndoOutlined />,
        path: '/sales_returns',
      },
    ],
  },
  {
    key: 'Stock Audit',
    label: 'Stock Audit',
    icon: <ContainerOutlined />,
    children: [
      {
        key: 'stock-in',
        label: 'Stock In',
        icon: <PlusCircleOutlined />,
        path: '/stock_audit',
      },
      {
        key: 'stock-out',
        label: 'Stock Out',
        icon: <MinusCircleOutlined />,
        path: '/stock_out',
      },
      {
        key: 'organisation-stock-available',
        label: 'Org Stock Available',
        icon: <DatabaseOutlined />,
        path: '/stock_available',
      },
      {
        key: 'branch-stock',
        label: 'Branch Stock',
        icon: <MinusCircleOutlined />,
        path: '/branch_stock',
      },
      {
        key: 'branch-stock-available',
        label: 'Branch Stock Available',
        icon: <DatabaseOutlined />,
        path: '/branch_stock_available',
      },
      {
        key: 'storage-stock-list',
        label: 'Storage Stock List',
        icon: <DatabaseOutlined />,
        path: '/storage_stock_list',
      },
    ],
  },
  {
    key: 'Procurement',
    label: 'Procurement',
    icon: <ShoppingOutlined />,
    children: [
      {
        key: 'purchase-orders',
        label: 'Purchase Orders',
        icon: <InboxOutlined />,
        path: '/purchase_orders',
      },
      {
        key: 'vendor',
        label: 'Vendors',
        icon: <SolutionOutlined />,
        path: '/vendor_crud',
      },
    ],
  },
  {
    key: 'customers',
    label: 'Customers',
    icon: <UserOutlined />,
    children: [
      {
        key: 'add-customer',
        label: 'Customer',
        path: '/customer_crud',
      },
      {
        key: 'customer-points',
        label: 'Customer Points',
        path: '/customer_points',
      },
    ],
  },
  {
    key: 'products',
    label: 'Products',
    icon: <ShoppingCartOutlined />,
    children: [
      {
        key: 'add-product',
        label: 'Product',
        icon: <AppstoreAddOutlined />,
        path: '/product_crud',
      },
      {
        key: 'unit',
        label: 'Unit',
        icon: <FolderOpenOutlined />,
        path: '/unit_crud',
      },
      {
        key: 'category',
        label: 'Category',
        icon: <FolderOpenOutlined />,
        path: '/category_crud',
      },
      {
        key: 'variant',
        label: 'Variant',
        icon: <FolderOpenOutlined />,
        path: '/variant_crud',
      },
      {
        key: 'warehouse',
        label: 'Warehouse',
        icon: <HomeOutlined />,
        path: '/warehouse_crud',
      },
      {
        key: 'rack',
        label: 'Rack',
        icon: <FolderOpenOutlined />,
        path: '/rack_crud',
      },
    ],
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: <DollarCircleOutlined />,
    children: [
      {
        key: 'payment-history',
        label: 'Payment History',
        icon: <BarChartOutlined />,
        path: 'payment_history',
      },
      {
        key: 'expenses',
        label: 'Expenses',
        icon: <PieChartOutlined />,
        path: '/expenses',
      },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <BarChartOutlined />,
    children: [
      {
        key: 'report',
        label: 'Report',
        icon: <FileSearchOutlined />,
        path: '/reports',
      },
    ],
  },
  {
    key: 'custom_forms',
    label: 'Custom Forms',
    icon: <AppstoreOutlined />,
    path: '/entities',
  },
  {
    key: 'master_settings',
    label: 'Master Settings',
    icon: <SettingOutlined />,
    children: [
      {
        key: 'organisation',
        label: 'Organisation',
        icon: <BankOutlined />,
        path: '/organisation',
      },
      {
        key: 'braches',
        label: 'Braches',
        icon: <BankOutlined />,
        path: '/branches',
      },
      {
        key: 'users',
        label: 'Users',
        icon: <BankOutlined />,
        path: '/users',
      },
      {
        key: 'roles',
        label: 'Roles',
        icon: <BankOutlined />,
        path: '/roles',
      },
      {
        key: 'role_type',
        label: 'Role Type',
        icon: <BankOutlined />,
        path: '/role_type',
      },
      {
        key: 'permissions',
        label: 'Permissions',
        icon: <BankOutlined />,
        path: '/permissions',
      },
    ],
  },
  {
    key: 'tenant_manage',
    label: 'Tenant Manage',
    icon: <SettingOutlined />,
    children: [
      {
        key: 'tenant_account_list',
        label: 'Tenant List',
        icon: <BankOutlined />,
        path: '/tenant_account',
      },
    ],
  },
];
