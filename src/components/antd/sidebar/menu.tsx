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
} from '@ant-design/icons';
import { getPermissions, isSuperAdmin, canManageTenants, getMenuKeys, getUserData } from '../../../helpers/permissionHelper';

// Function to filter menu items based on permissions
export const getFilteredMenuItems = () => {
  try {
    // SuperAdmin can see all menus without restrictions
    const isSuper = isSuperAdmin();
    
    if (isSuper) {
      return menuItems;
    }
    
    // Try new API structure first (allowedMenuKeys array from login response)
    const menuKeys = getMenuKeys();
    
    if (menuKeys && menuKeys.length > 0) {
      const filteredItems = menuItems.map(item => {
        // If item has children, filter them based on allowedMenuKeys
        if (item.children) {
          const filteredChildren = item.children.filter(child => {
            return menuKeys.includes(child.key);
          });

          // Only show parent if it has visible children
          return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null;
        }

        // For single menu items, check if allowed
        return menuKeys.includes(item.key) ? item : null;
      }).filter(Boolean);
      
      return filteredItems;
    }
    
    // Fallback to old structure (permissions with allowed_menu_keys)
    const permissions = getPermissions();
    
    // If no permissions found, show nothing
    if (!permissions || Object.keys(permissions).length === 0) {
      return []; // Show nothing when no permissions
    }
    
    // Get all allowed menu keys from permissions
    const allowedMenuKeys = new Set<string>();
    Object.values(permissions).forEach((perm: any) => {
      if (perm.allowed_menu_keys && Array.isArray(perm.allowed_menu_keys)) {
        perm.allowed_menu_keys.forEach((key: string) => allowedMenuKeys.add(key));
      }
    });

    // If no allowed menu keys, show nothing
    if (allowedMenuKeys.size === 0) {
      return []; // Show nothing when no allowed menu keys
    }

    const filteredItems = menuItems.map(item => {
      // If item has children, filter them based on allowed_menu_keys
      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          return allowedMenuKeys.has(child.key);
        });

        // Only show parent if it has visible children
        return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null;
      }

      // For single menu items, check if allowed
      return allowedMenuKeys.has(item.key) ? item : null;
    }).filter(Boolean);
    
    return filteredItems;
  } catch (error) {
    console.error('Error filtering menu items:', error);
    // Show nothing if there's an error
    return [];
  }
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
    key: 'customers',
    label: 'Customers',
    icon: <UserOutlined />,
    children: [
      {
        key: 'add-customer',
        label: 'Customer',
        icon: <IdcardOutlined />,
        path: '/customer_crud',
      },
      {
        key: 'vendor',
        label: 'Vendor',
        icon: <SolutionOutlined />,
        path: '/vendor_crud',
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
        path: '/prduct_crud',
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
    key: 'custom_entities',
    label: 'Custom Forms',
    icon: <AppstoreOutlined />,
    path: '/entities',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingOutlined />,
    path: '/settings',
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
