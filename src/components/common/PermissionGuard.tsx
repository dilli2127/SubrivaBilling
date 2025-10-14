/**
 * PermissionGuard Component
 * Conditionally renders children based on user permissions
 */

import React from 'react';
import { Tooltip } from 'antd';
import { hasPermission, PermissionAction } from '../../helpers/permissionHelper';

interface PermissionGuardProps {
  resource: string;
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
  tooltipMessage?: string;
}

/**
 * PermissionGuard - Shows/hides content based on permissions
 * 
 * @example
 * <PermissionGuard resource="customer" action="create">
 *   <Button>Create Customer</Button>
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  children,
  fallback = null,
  showTooltip = false,
  tooltipMessage,
}) => {
  const hasAccess = hasPermission(resource, action);

  if (!hasAccess) {
    if (showTooltip) {
      return (
        <Tooltip title={tooltipMessage || `You don't have permission to ${action} ${resource}`}>
          <span>{fallback}</span>
        </Tooltip>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface DisableIfNoPermissionProps {
  resource: string;
  action: PermissionAction;
  children: React.ReactElement;
  tooltipMessage?: string;
}

/**
 * DisableIfNoPermission - Disables child element if no permission
 * Child must accept 'disabled' prop
 * 
 * @example
 * <DisableIfNoPermission resource="customer" action="delete">
 *   <Button>Delete</Button>
 * </DisableIfNoPermission>
 */
export const DisableIfNoPermission: React.FC<DisableIfNoPermissionProps> = ({
  resource,
  action,
  children,
  tooltipMessage,
}) => {
  const hasAccess = hasPermission(resource, action);

  if (!hasAccess) {
    return (
      <Tooltip title={tooltipMessage || `You don't have permission to ${action} ${resource}`}>
        {React.cloneElement(children, { disabled: true } as any)}
      </Tooltip>
    );
  }

  return children;
};

export default PermissionGuard;

