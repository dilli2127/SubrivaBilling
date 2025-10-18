import React, { memo } from 'react';
import RolesCrudNew from './RolesCrudNew';

/**
 * Roles CRUD Page - Main Entry Point
 * 
 * Updated to use new permission system that sends `permissions` array
 * instead of `allowedMenuKeys` to the backend.
 */
const RolesCrud: React.FC = () => {
  return <RolesCrudNew />;
};

export default memo(RolesCrud);
