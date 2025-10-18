/**
 * Resource Constants - Available Resources for Permission Management
 * 
 * This file defines all available resources in the system and their metadata.
 * Used by the Role creation/edit forms to display permission checkboxes.
 */

export interface ResourceDefinition {
  resource: string;
  label: string;
  category: string;
  description: string;
  menus: string[];
}

/**
 * All available resources in the system
 * Each resource maps to backend API endpoints and controls menu visibility
 */
export const AVAILABLE_RESOURCES: ResourceDefinition[] = [
  // Core
  { 
    resource: 'dashboard', 
    label: 'Dashboard',
    category: 'Core',
    description: 'Main dashboard view',
    menus: ['dashboard']
  },
  
  // Sales (Shared API - one permission controls multiple menus)
  { 
    resource: 'sales_record', 
    label: 'Sales Records',
    category: 'Sales',
    description: 'Controls: SalesRecords menu, Create Sales, Sales List',
    menus: ['SalesRecords', 'create-sales-record', 'sales-records-list']
  },
  
  // Customers & Vendors (Separate APIs)
  { 
    resource: 'customer', 
    label: 'Customers',
    category: 'Sales',
    description: 'Customer management',
    menus: ['add-customer']
  },
  { 
    resource: 'vendor', 
    label: 'Vendors',
    category: 'Sales',
    description: 'Vendor management',
    menus: ['vendor']
  },
  
  // Products (Separate APIs for each)
  { 
    resource: 'product', 
    label: 'Products',
    category: 'Inventory',
    description: 'Product management',
    menus: ['add-product']
  },
  { 
    resource: 'unit', 
    label: 'Units',
    category: 'Inventory',
    description: 'Unit management',
    menus: ['unit']
  },
  { 
    resource: 'category', 
    label: 'Categories',
    category: 'Inventory',
    description: 'Category management',
    menus: ['category']
  },
  { 
    resource: 'variant', 
    label: 'Variants',
    category: 'Inventory',
    description: 'Variant management',
    menus: ['variant']
  },
  { 
    resource: 'warehouse', 
    label: 'Warehouses',
    category: 'Inventory',
    description: 'Warehouse management',
    menus: ['warehouse']
  },
  { 
    resource: 'rack', 
    label: 'Racks',
    category: 'Inventory',
    description: 'Rack management',
    menus: ['rack']
  },
  
  // Stock Management (Mixed - some share APIs, some don't)
  { 
    resource: 'stock_audit', 
    label: 'Stock In / Org Stock',
    category: 'Stock',
    description: 'Controls: Stock In, Organisation Stock Available',
    menus: ['stock-in', 'organisation-stock-available']
  },
  { 
    resource: 'stock_out', 
    label: 'Stock Out',
    category: 'Stock',
    description: 'Stock out management',
    menus: ['stock-out']
  },
  { 
    resource: 'branch_stock', 
    label: 'Branch Stock',
    category: 'Stock',
    description: 'Controls: Branch Stock, Branch Stock Available',
    menus: ['branch-stock', 'branch-stock-available']
  },
  { 
    resource: 'storage_stock', 
    label: 'Storage Stock',
    category: 'Stock',
    description: 'Storage stock list',
    menus: ['storage-stock-list']
  },
  
  // Financial
  { 
    resource: 'payment_history', 
    label: 'Payment History',
    category: 'Financial',
    description: 'Payment history management',
    menus: ['payment-history']
  },
  { 
    resource: 'expense', 
    label: 'Expenses',
    category: 'Financial',
    description: 'Expense management',
    menus: ['expenses']
  },
  
  // Reports
  { 
    resource: 'reports', 
    label: 'Reports',
    category: 'Reports',
    description: 'All reports',
    menus: ['reports', 'report']
  },
  
  // Advanced
  { 
    resource: 'custom_entities', 
    label: 'Custom Forms',
    category: 'Advanced',
    description: 'Custom entity management',
    menus: ['custom_entities']
  },
  
  // Settings
  { 
    resource: 'settings', 
    label: 'Settings',
    category: 'Settings',
    description: 'Application settings',
    menus: ['settings']
  },
  
  // Master Settings
  { 
    resource: 'organisation', 
    label: 'Organisation',
    category: 'Master Settings',
    description: 'Organisation management',
    menus: ['organisation']
  },
  { 
    resource: 'branch', 
    label: 'Branches',
    category: 'Master Settings',
    description: 'Branch management',
    menus: ['braches']
  },
  { 
    resource: 'billing_user', 
    label: 'Users',
    category: 'Master Settings',
    description: 'User management',
    menus: ['users']
  },
  { 
    resource: 'role', 
    label: 'Roles',
    category: 'Master Settings',
    description: 'Role management',
    menus: ['roles']
  },
  { 
    resource: 'permission', 
    label: 'Permissions',
    category: 'Master Settings',
    description: 'Permission management',
    menus: ['permissions']
  },
  
  // Tenant Management
  { 
    resource: 'tenant_account', 
    label: 'Tenant Accounts',
    category: 'Tenant Management',
    description: 'Tenant account management',
    menus: ['tenant_account_list']
  },
  { 
    resource: 'entity_definition', 
    label: 'Entity Definitions',
    category: 'Tenant Management',
    description: 'Entity definition management',
    menus: ['entity_definitions']
  }
];

/**
 * Group resources by category
 */
export const getGroupedResources = (): Record<string, ResourceDefinition[]> => {
  return AVAILABLE_RESOURCES.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<string, ResourceDefinition[]>);
};

/**
 * Get all categories
 */
export const getCategories = (): string[] => {
  return Array.from(new Set(AVAILABLE_RESOURCES.map(r => r.category)));
};

/**
 * Get resource by name
 */
export const getResourceByName = (resourceName: string): ResourceDefinition | undefined => {
  return AVAILABLE_RESOURCES.find(r => r.resource === resourceName);
};

