/**
 * PermissionAwareCrudPage
 * Wrapper around GenericCrudPage that automatically applies permission checks
 */

import React from 'react';
import { GenericCrudPage } from './GenericCrudPage';
import { canCreate, canUpdate, canDelete, RESOURCES } from '../../helpers/permissionHelper';
import { BaseEntity } from '../../types/entities';
import { CrudConfig } from '../../hooks/useGenericCrud';
import { CrudColumn, CrudFormItem, FilterConfig, CustomButtonConfig } from './GenericCrudPage';

interface PermissionAwareCrudPageProps<T extends BaseEntity> {
  resource: string; // Resource name for permission checks
  config: Omit<CrudConfig<T>, 'columns' | 'formItems'> & {
    columns: CrudColumn[];
    formItems: CrudFormItem[];
    metadataFieldName?: string;
    canCreate?: () => boolean;
    canEdit?: (record: any) => boolean;
    canDelete?: (record: any) => boolean;
  };
  filters?: FilterConfig[];
  onFilterChange?: (values: Record<string, any>) => void;
  customButtons?: CustomButtonConfig[];
  onValuesChange?: (changed: any, all: any) => void;
  enableSuperAdminFilters?: boolean;
  enableDynamicFields?: boolean;
  showDynamicColumnsInTable?: boolean;
  entityName?: string;
}

/**
 * PermissionAwareCrudPage
 * 
 * Automatically applies permission checks to CRUD operations:
 * - Hides "Add" button if no create permission
 * - Disables edit action if no update permission
 * - Disables delete action if no delete permission
 * 
 * @example
 * <PermissionAwareCrudPage
 *   resource="customer"
 *   config={{
 *     title: 'Customers',
 *     columns: customerColumns,
 *     formItems: customerFormItems,
 *     apiRoutes: getEntityApiRoutes('Customer'),
 *   }}
 * />
 */
export function PermissionAwareCrudPage<T extends BaseEntity>({
  resource,
  config,
  ...otherProps
}: PermissionAwareCrudPageProps<T>) {
  // Check permissions
  const canCreateResource = canCreate(resource);
  const canUpdateResource = canUpdate(resource);
  const canDeleteResource = canDelete(resource);

  // Merge permission checks with any existing custom logic
  const enhancedConfig = {
    ...config,
    // Combine permission checks with custom logic (if any)
    canCreate: config.canCreate 
      ? () => canCreateResource && config.canCreate!()
      : () => canCreateResource,
    canEdit: config.canEdit
      ? (record: any) => canUpdateResource && config.canEdit!(record)
      : () => canUpdateResource,
    canDelete: config.canDelete
      ? (record: any) => canDeleteResource && config.canDelete!(record)
      : () => canDeleteResource,
  };

  return <GenericCrudPage config={enhancedConfig} {...otherProps} />;
}

export default PermissionAwareCrudPage;

