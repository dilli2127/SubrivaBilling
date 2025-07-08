import { menuItems } from "../components/antd/layout/menu";

// src/helpers/auth.ts
export function getCurrentUserRole() {
  const data = sessionStorage.getItem('user');
  if (!data) return null;
  const user = JSON.parse(data);
  // Adjust as needed for your user object structure
  return user?.roleItems?.name || user?.usertype || user?.user_role || null;
}

export const getAllKeysExcludingTenantManage = (items: any[]): string[] =>
  items.reduce((acc: string[], item: any) => {
    if (item.key === 'tenant_manage') return acc;
    acc.push(item.key);
    if (item.children) {
      acc.push(...getAllKeysExcludingTenantManage(item.children));
    }
    return acc;
  }, []);


export  const getAllowedMenuKeys = (user: any): string[] => {
  const role =
    user?.roleItems?.name?.toLowerCase() ||
    user?.usertype?.toLowerCase() ||
    user?.user_role?.toLowerCase();

  const allowed = Array.isArray(user?.roleItems?.allowedMenuKeys)
    ? user.roleItems.allowedMenuKeys
    : [];

  if (role === 'superadmin') {
    // Return all menu keys (including children) for superadmin
    const getAllKeys = (items: any[]): string[] =>
      items.reduce((acc: string[], item: any) => {
        acc.push(item.key);
        if (item.children) {
          acc.push(...getAllKeys(item.children));
        }
        return acc;
      }, []);
    return getAllKeys(menuItems);
  }

  if (role === 'tenant') {
    return getAllKeysExcludingTenantManage(menuItems);
  }

  return allowed;
};