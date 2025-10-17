/**
 * Permission Helper Utilities
 * Provides functions to check and manage user permissions
 */

import SessionStorageEncryption from './encryption';

export interface ResourcePermission {
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  allowed_menu_keys?: string[];
  resource?: string;
}

export interface PermissionsMap {
  [resource: string]: ResourcePermission;
}

export interface UserData {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  UserItem?: {
    username?: string;
    name?: string;
    email?: string;
    roleItems?: {
      name?: string;
      roles_type?: string;
      organisation_id?: string;
      branch_id?: string;
    };
    organisationItems?: {
      name?: string;
    };
    branchItems?: {
      name?: string;
    };
  };
  permissions?: PermissionsMap;
  allowedMenuKeys?: string[];
  // Deprecated: menuConfig removed from backend, use permissions instead
  menuConfig?: {
    [resource: string]: {
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
      allowedMenuKeys: string[];
    };
  };
  scope?: {
    isOrgAdmin?: boolean;
    isBranchAdmin?: boolean;
    scopeLevel?: string;
    organisationId?: string;
    branchId?: string;
  };
}

/**
 * Resource names - Use these constants to avoid typos
 */
export const RESOURCES = {
  // Core entities
  CUSTOMER: 'customer',
  PRODUCT: 'product',
  SALES_RECORD: 'sales_record',
  PAYMENT_HISTORY: 'payment_history',
  EXPENSE: 'expense',
  VENDOR: 'vendor',
  WAREHOUSE: 'warehouse',
  STOCK_AUDIT: 'stock_audit',
  STOCK_OUT: 'stock_out',
  CATEGORY: 'category',
  UNIT: 'unit',
  VARIANT: 'variant',
  BRANCH: 'branch',
  RACK: 'rack',
  USER: 'user',
  ROLE: 'role',
  
  // Stock related
  BRANCH_STOCK: 'branch_stock',
  ORGANISATION_STOCK: 'organisation_stock',
  
  // Reports
  CUSTOMER_REPORT: 'customer_report',
  SALES_REPORT: 'sales_report',
  
  // System
  DASHBOARD: 'dashboard',
  
  // Legacy/Additional
  SALES_RECORD_ITEMS: 'sales_record_items',
  ORGANISATION: 'organisation',
  TENANT_ACCOUNT: 'tenant_account',
  FIELD_METADATA: 'field_metadata',
  ENTITY_DEFINITION: 'entity_definition',
  INVOICE_NUMBER: 'invoice_number',
  STOCK_STORAGE: 'stock_storage',
} as const;

/**
 * Action types
 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

/**
 * Get all permissions from localStorage
 */
export function getPermissions(): PermissionsMap {
  try {
    const perms = localStorage.getItem('permissions');
    return perms ? JSON.parse(perms) : {};
  } catch (error) {
    console.error('Error reading permissions:', error);
    return {};
  }
}

/**
 * Store permissions in localStorage
 */
export function setPermissions(permissions: PermissionsMap): void {
  try {
    localStorage.setItem('permissions', JSON.stringify(permissions));
  } catch (error) {
    console.error('Error storing permissions:', error);
  }
}

/**
 * Clear permissions from localStorage
 */
export function clearPermissions(): void {
  localStorage.removeItem('permissions');
  localStorage.removeItem('menuKeys');
  localStorage.removeItem('userData');
}

/**
 * Get allowedMenuKeys from localStorage
 * Note: Stored as 'menuKeys' for backward compatibility
 */
export function getMenuKeys(): string[] {
  try {
    const menuKeys = localStorage.getItem('menuKeys');
    if (menuKeys) {
      return JSON.parse(menuKeys);
    }
    return [];
  } catch (error) {
    console.error('Error getting allowedMenuKeys:', error);
    return [];
  }
}

/**
 * Store allowedMenuKeys in localStorage
 * Note: Stored as 'menuKeys' for backward compatibility
 * @param menuKeys - Array of allowed menu keys (from response.allowedMenuKeys)
 */
export function setMenuKeys(menuKeys: string[]): void {
  try {
    localStorage.setItem('menuKeys', JSON.stringify(menuKeys));
  } catch (error) {
    console.error('Error setting allowedMenuKeys:', error);
  }
}

/**
 * Get complete user data from localStorage
 */
export function getUserData(): UserData | null {
  try {
    // Try encrypted storage first
    const userData = SessionStorageEncryption.getItem('userData');
    if (userData) {
      return userData;
    }
    
    // Fallback to direct localStorage
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return null;
  } catch (error) {
    console.error('Error getting userData:', error);
    return null;
  }
}

/**
 * Store complete user data in localStorage
 */
export function setUserData(userData: UserData): void {
  try {
    // Store in encrypted session storage
    SessionStorageEncryption.setItem('userData', userData);
    // Also store in localStorage for backward compatibility
    localStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error setting userData:', error);
  }
}

/**
 * Check if user has a specific permission
 * @param resource - Resource name (e.g., 'customer', 'product')
 * @param action - Action type ('create', 'read', 'update', 'delete')
 * @returns boolean - true if user has permission
 */
export function hasPermission(
  resource: string,
  action: PermissionAction
): boolean {
  // SuperAdmin bypasses all permission checks
  if (isSuperAdmin()) {
    return true;
  }

  const permissions = getPermissions();
  const resourcePerms = permissions[resource];
  
  if (!resourcePerms) {
    return false;
  }

  return resourcePerms[`can_${action}`] === true;
}

/**
 * Shorthand functions for common permission checks
 */
export const canCreate = (resource: string): boolean => 
  hasPermission(resource, 'create');

export const canRead = (resource: string): boolean => 
  hasPermission(resource, 'read');

export const canUpdate = (resource: string): boolean => 
  hasPermission(resource, 'update');

export const canDelete = (resource: string): boolean => 
  hasPermission(resource, 'delete');

/**
 * Check if user has ANY permission for a resource
 * (useful for showing/hiding entire sections)
 */
export function hasAnyPermission(resource: string): boolean {
  const permissions = getPermissions();
  const perms = permissions[resource];
  
  if (!perms) {
    return false;
  }

  return (
    perms.can_create ||
    perms.can_read ||
    perms.can_update ||
    perms.can_delete
  );
}

/**
 * Check multiple permissions at once
 * @param checks - Array of {resource, action} pairs
 * @returns boolean - true if user has ALL specified permissions
 */
export function hasAllPermissions(
  checks: Array<{ resource: string; action: PermissionAction }>
): boolean {
  return checks.every(({ resource, action }) => 
    hasPermission(resource, action)
  );
}

/**
 * Check if user has any of multiple permissions
 * @param checks - Array of {resource, action} pairs
 * @returns boolean - true if user has ANY of the specified permissions
 */
export function hasAnyOfPermissions(
  checks: Array<{ resource: string; action: PermissionAction }>
): boolean {
  return checks.some(({ resource, action }) => 
    hasPermission(resource, action)
  );
}

/**
 * Get permission object for a specific resource
 */
export function getResourcePermissions(
  resource: string
): ResourcePermission | null {
  const permissions = getPermissions();
  return permissions[resource] || null;
}

/**
 * Get all resources that user has read access to
 * (useful for menu filtering)
 */
export function getReadableResources(): string[] {
  const permissions = getPermissions();
  return Object.keys(permissions).filter(
    resource => permissions[resource]?.can_read === true
  );
}

/**
 * Check if user can see tenant management section
 * Only SuperAdmin can see tenant management
 */
export function canManageTenants(): boolean {
  return isSuperAdmin();
}

/**
 * Check if user is superadmin (bypasses all permission checks)
 * Note: This checks the new API structure first, then falls back to old structure
 */
export function isSuperAdmin(): boolean {
  try {
    // First check new API structure (userData)
    const newUserData = getUserData();
    if (newUserData) {
      // Check scope level first (most reliable)
      if (newUserData.scope?.scopeLevel === 'superadmin') {
        return true;
      }
      
      // Check roleItems
      const roleType = newUserData.UserItem?.roleItems?.roles_type?.toLowerCase();
      if (roleType === 'superadmin' || roleType === 'super_admin') {
        return true;
      }
    }
    
    // Fallback to old structure for backward compatibility
    // Try encrypted storage first
    let oldUserData = SessionStorageEncryption.getItem('user');
    
    if (!oldUserData) {
      // Try direct localStorage/sessionStorage as fallback
      let user = localStorage.getItem('user');
      if (!user) {
        user = sessionStorage.getItem('user');
      }
      
      if (!user) {
        return false;
      }
      
      try {
        oldUserData = JSON.parse(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return false;
      }
    }
    
    // Check all possible role fields
    const rolesType = oldUserData?.roles_type;
    const role = oldUserData?.role;
    const roleItems = oldUserData?.roleItems;
    const userType = oldUserData?.usertype;
    
    const roleType = rolesType?.toLowerCase() || 
                     role?.toLowerCase() || 
                     roleItems?.roles_type?.toLowerCase() ||
                     roleItems?.name?.toLowerCase() ||
                     userType?.toLowerCase();
    
    return roleType === 'superadmin' || roleType === 'super_admin';
  } catch (error) {
    console.error('Error checking superadmin status:', error);
    return false;
  }
}

