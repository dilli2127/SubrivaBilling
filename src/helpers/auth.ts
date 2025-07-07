// src/helpers/auth.ts
export function getCurrentUserRole() {
  const data = sessionStorage.getItem('user');
  if (!data) return null;
  const user = JSON.parse(data);
  // Adjust as needed for your user object structure
  return user?.roleItems?.name || user?.usertype || user?.user_role || null;
}
