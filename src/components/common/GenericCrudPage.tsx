import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Button,
  Row,
  Input,
  Tooltip,
  Select,
  DatePicker,
  Space,
  Col,
  Popconfirm,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGenericCrud, CrudConfig } from '../../hooks/useGenericCrud';
import { BaseEntity } from '../../types/entities';
import GlobalDrawer from '../antd/GlobalDrawer';
import AntdForm from '../antd/form/form';
import GlobalTable from '../antd/GlobalTable';
import { useSuperAdminFilters } from '../../hooks/useSuperAdminFilters';
import { useFieldMetadata } from '../../hooks/useFieldMetadata';
import FieldMetadataManager from '../FieldMetadataManager';

// Filter and Button Config Types
export type FilterConfig = {
  key: string;
  label: string;
  type: 'input' | 'select' | 'date';
  options?: { label: string; value: any }[]; // for select
  placeholder?: string;
  width?: string | number;
  disabled?: boolean;
  onChange?: (value: any) => void;
};

export type CustomButtonConfig = {
  key: string;
  label: string;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  onClick: () => void;
  icon?: React.ReactNode;
};

// Add type definitions for columns and formItems
export interface CrudColumn {
  title: string;
  dataIndex?: any;
  key: string;
  render?: (value: any, record: any) => React.ReactNode;
}

export interface CrudFormItem {
  label: string;
  name: string;
  rules?: any[];
  component: React.ReactNode;
  valuePropName?: string;
}

interface GenericCrudPageProps<T extends BaseEntity> {
  config: Omit<CrudConfig<T>, 'columns' | 'formItems'> & {
    columns: CrudColumn[];
    formItems: CrudFormItem[];
    metadataFieldName?: string; // Field name for metadata (default: 'meta_data_values', can be 'custom_data')
  };
  filters?: FilterConfig[];
  onFilterChange?: (values: Record<string, any>) => void;
  customButtons?: CustomButtonConfig[];
  onValuesChange?: (changed: any, all: any) => void;
  enableSuperAdminFilters?: boolean; // Enable tenant/org/branch dropdowns for superadmin
  enableDynamicFields?: boolean; // Enable dynamic field metadata in form
  showDynamicColumnsInTable?: boolean; // Show dynamic metadata columns in table (default: false for static CRUDs)
  entityName?: string; // Entity name for dynamic fields (e.g., 'products', 'customers')
}

// Extract actions column to a helper
function getActionsColumn(
  title: string, 
  handleEdit: (record: any) => void, 
  handleDelete: (record: any) => void,
  deleteLoading: boolean = false,
  canEdit?: (record: any) => boolean,
  canDelete?: (record: any) => boolean
) {
  return {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: object) => {
      const allowEdit = canEdit ? canEdit(record) : true;
      const allowDelete = canDelete ? canDelete(record) : true;
      
      return (
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Tooltip title={allowEdit ? `Edit ${title}` : 'No permission to edit'}>
            <EditOutlined
              style={{ 
                cursor: allowEdit ? 'pointer' : 'not-allowed', 
                color: allowEdit ? '#1890ff' : '#d9d9d9',
                opacity: allowEdit ? 1 : 0.5,
                fontSize: '16px',
                padding: '4px'
              }}
              onClick={() => allowEdit && handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={allowDelete ? `Delete ${title}` : 'No permission to delete'}>
            <Popconfirm
              title={`Delete ${title}`}
              description="Are you sure you want to delete this item?"
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
              disabled={deleteLoading || !allowDelete}
            >
              <DeleteOutlined
                style={{ 
                  cursor: (deleteLoading || !allowDelete) ? 'not-allowed' : 'pointer', 
                  color: (deleteLoading || !allowDelete) ? '#d9d9d9' : '#ff4d4f',
                  opacity: (deleteLoading || !allowDelete) ? 0.5 : 1,
                  fontSize: '16px',
                  padding: '4px'
                }}
              />
            </Popconfirm>
          </Tooltip>
        </div>
      );
    },
  };
}

export const GenericCrudPage = <T extends BaseEntity>({
  config,
  filters = [],
  onFilterChange,
  customButtons = [],
  onValuesChange,
  enableSuperAdminFilters = true, // Enabled by default
  enableDynamicFields = false,
  showDynamicColumnsInTable = false, // Disabled by default for static CRUDs
  entityName,
}: GenericCrudPageProps<T>) => {
  // SuperAdmin filters hook
  const superAdminFilters = useSuperAdminFilters();
  const isInitialMount = useRef(true);
  
  // Dynamic fields hook - fetch first to get field names
  const {
    formItems: mergedFormItems,
    loading: metadataLoading,
    refresh: refreshMetadata,
    dynamicFields,
  } = useFieldMetadata({
    entityName: entityName || config.title.toLowerCase(),
    staticFormItems: config.formItems,
    enabled: enableDynamicFields,
  });

  // Extract dynamic field names for payload separation - memoized
  const dynamicFieldNames = useMemo(
    () => enableDynamicFields && dynamicFields ? dynamicFields.map((field) => field.field_name) : [],
    [dynamicFields, enableDynamicFields]
  );

  // Memoize config with dynamic field names
  const enhancedConfig = useMemo(
    () => ({
      ...config,
      dynamicFieldNames: dynamicFieldNames.length > 0 ? dynamicFieldNames : undefined,
    }),
    [config, dynamicFieldNames]
  );
  
  const {
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    items,
    pagination,
    drawerVisible,
    initialValues,
    form,
    handleEdit,
    handleDelete,
    handleDrawerOpen,
    resetForm,
    handleSubmit,
    handlePaginationChange,
    columns,
    formItems: staticFormItems,
    formColumns = 2,
    drawerWidth,
    filterValues,
    setFilterValues,
  } = useGenericCrud(enhancedConfig);

  // Use merged form items if dynamic fields are enabled
  const formItems = enableDynamicFields ? mergedFormItems : staticFormItems;

  // Generate dynamic columns from field metadata if enabled
  const enhancedColumns = useMemo(() => {
    // Only add dynamic columns to table if explicitly enabled
    if (!showDynamicColumnsInTable || !enableDynamicFields || !dynamicFields || dynamicFields.length === 0) {
      return columns;
    }

    // Import the column generation utility
    const { generateColumnsFromMetadata } = require('../../helpers/columnUtils');
    
    // For normal forms (like Products), combine config.columns with dynamic fields
    // For pure dynamic forms (like DynamicEntity), show only dynamic fields
    const isPureDynamicForm = columns.length <= 3 && 
      columns.every((col: any) => ['_id', 'createdAt', 'updatedAt'].includes(col.key));
    
    if (isPureDynamicForm) {
      // Pure dynamic form - show all dynamic fields only
      const allFieldNames = dynamicFields.map(field => field.field_name);
      return generateColumnsFromMetadata(dynamicFields, allFieldNames);
    } else {
      // Normal form - combine existing columns with dynamic fields
      const dynamicFieldNames = dynamicFields.map(field => field.field_name);
      const dynamicColumns = generateColumnsFromMetadata(dynamicFields, dynamicFieldNames);
      
      // Combine existing columns with dynamic columns
      const existingKeys = columns.map((col: any) => col.key);
      const newDynamicColumns = dynamicColumns.filter((col: any) => !existingKeys.includes(col.key));
      
      return [...columns, ...newDynamicColumns];
    }
  }, [columns, showDynamicColumnsInTable, enableDynamicFields, dynamicFields]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    const newValues = { ...filterValues, [key]: value };
    // Include superadmin filters if enabled
    const allFilters = enableSuperAdminFilters 
      ? { ...newValues, ...superAdminFilters.getApiFilters() }
      : newValues;
    setFilterValues(allFilters);
    if (onFilterChange) onFilterChange(allFilters);
  }, [filterValues, setFilterValues, onFilterChange, enableSuperAdminFilters, superAdminFilters]);

  // Apply superadmin filters whenever they change
  useEffect(() => {
    // Skip the initial mount to avoid duplicate API call
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (enableSuperAdminFilters) {
      const apiFilters = superAdminFilters.getApiFilters();
      const newFilters = { ...filterValues, ...apiFilters };
      setFilterValues(newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    superAdminFilters.selectedTenant,
    superAdminFilters.selectedOrganisation,
    superAdminFilters.selectedBranch,
    enableSuperAdminFilters,
  ]);

  const tableColumns = useMemo(() => [
    ...enhancedColumns,
    getActionsColumn(config.title, handleEdit, handleDelete, deleteLoading, config.canEdit, config.canDelete)
  ], [enhancedColumns, config.title, handleEdit, handleDelete, deleteLoading, config.canEdit, config.canDelete]);

  return (
    <div>
      <Row
        justify="end"
        align="bottom"
        gutter={[16, 16]}
        style={{ marginBottom: 16 }}
      >
        {/* Title aligned left */}
        <Col flex="auto">
          <h1 style={{ margin: 0 }}>{config.title}</h1>
        </Col>

        {/* Filters + Actions aligned right and bottom */}
        <Col>
          <Row gutter={[12, 12]} align="bottom" justify="end" wrap>
            {/* SuperAdmin Filters */}
            {enableSuperAdminFilters && superAdminFilters.isSuperAdmin && (
              <Col>
                <Select
                  placeholder="Select Tenant"
                  value={superAdminFilters.selectedTenant}
                  onChange={(value) => {
                    superAdminFilters.handleTenantChange(value);
                    handleFilterChange('tenant_id', value === 'all' ? undefined : value);
                  }}
                  allowClear
                  style={{ width: 200 }}
                  loading={superAdminFilters.tenantsLoading}
                  disabled={createLoading || updateLoading || deleteLoading}
                >
                  <Select.Option value="all">All Tenants</Select.Option>
                  {superAdminFilters.tenantOptions.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            )}
            
            {enableSuperAdminFilters && (superAdminFilters.isSuperAdmin || superAdminFilters.isTenant) && !superAdminFilters.isOrganisationUser && !superAdminFilters.isBranchUser && (
              <Col>
                <Select
                  placeholder={
                    superAdminFilters.isSuperAdmin && superAdminFilters.selectedTenant === 'all'
                      ? 'Select tenant first'
                      : 'Select Organisation'
                  }
                  value={superAdminFilters.selectedOrganisation}
                  onChange={(value) => {
                    superAdminFilters.handleOrganisationChange(value);
                    handleFilterChange('organisation_id', value === 'all' ? undefined : value);
                  }}
                  allowClear
                  style={{ width: 200 }}
                  loading={superAdminFilters.organisationsLoading}
                  disabled={
                    (superAdminFilters.isSuperAdmin && superAdminFilters.selectedTenant === 'all') ||
                    createLoading ||
                    updateLoading ||
                    deleteLoading
                  }
                >
                  <Select.Option value="all">All Organisations</Select.Option>
                  {superAdminFilters.organisationOptions.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            )}
            
            {enableSuperAdminFilters && (superAdminFilters.isSuperAdmin || superAdminFilters.isTenant || superAdminFilters.isOrganisationUser) && !superAdminFilters.isBranchUser && (
              <Col>
                <Select
                  placeholder={
                    (superAdminFilters.isSuperAdmin || superAdminFilters.isTenant) &&
                    superAdminFilters.selectedOrganisation === 'all'
                      ? 'Select organisation first'
                      : 'Select Branch'
                  }
                  value={superAdminFilters.selectedBranch}
                  onChange={(value) => {
                    superAdminFilters.handleBranchChange(value);
                    handleFilterChange('branch_id', value === 'all' ? undefined : value);
                  }}
                  allowClear
                  style={{ width: 200 }}
                  loading={superAdminFilters.branchesLoading}
                  disabled={
                    ((superAdminFilters.isSuperAdmin || superAdminFilters.isTenant) &&
                      superAdminFilters.selectedOrganisation === 'all') ||
                    createLoading ||
                    updateLoading ||
                    deleteLoading
                  }
                >
                  <Select.Option value="all">All Branches</Select.Option>
                  {superAdminFilters.branchOptions.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            )}

            {/* Filters */}
            {filters.map(filter => (
              <Col key={filter.key}>
                {filter.type === 'input' && (
                  <Input
                    placeholder={filter.placeholder || filter.label}
                    value={filterValues[filter.key] || ''}
                    onChange={e =>
                      handleFilterChange(filter.key, e.target.value)
                    }
                    style={{ width: filter.width || 200 }}
                    disabled={createLoading || updateLoading || deleteLoading}
                  />
                )}
                {filter.type === 'select' && (
                  <Select
                    placeholder={filter.placeholder || filter.label}
                    value={filterValues[filter.key]}
                    onChange={val => {
                      handleFilterChange(filter.key, val);
                      if (filter.onChange) filter.onChange(val);
                    }}
                    allowClear
                    style={{ width: filter.width || 200 }}
                    disabled={filter.disabled || createLoading || updateLoading || deleteLoading}
                  >
                    {filter.options?.map(opt => (
                      <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                )}
                {filter.type === 'date' && (
                  <DatePicker
                    placeholder={filter.placeholder || filter.label}
                    value={filterValues[filter.key]}
                    onChange={date => handleFilterChange(filter.key, date)}
                    style={{ width: filter.width || 200 }}
                    disabled={createLoading || updateLoading || deleteLoading}
                  />
                )}
              </Col>
            ))}

            {/* Search */}
            <Col>
              <Input
                placeholder={`Search ${config.title}`}
                value={filterValues['searchString'] || ''}
                onChange={e => handleFilterChange('searchString', e.target.value)}
                style={{ width: 200 }}
                disabled={createLoading || updateLoading || deleteLoading}
              />
            </Col>

            {/* Custom Buttons */}
            {customButtons.map(btn => (
              <Col key={btn.key}>
                <Button
                  type={btn.type || 'default'}
                  onClick={btn.onClick}
                  icon={btn.icon}
                  disabled={createLoading || updateLoading || deleteLoading}
                >
                  {btn.label}
                </Button>
              </Col>
            ))}

            {/* Field Metadata Manager */}
            {enableDynamicFields && (
              <Col>
                <FieldMetadataManager
                  entityName={entityName || config.title.toLowerCase()}
                  onFieldsUpdated={refreshMetadata}
                />
              </Col>
            )}


            {/* Add Button */}
            <Col>
              <Button 
                type="primary" 
                onClick={handleDrawerOpen}
                loading={createLoading}
                disabled={createLoading}
              >
                Add {config.title}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      <GlobalTable
        columns={tableColumns}
        data={items}
        loading={loading || deleteLoading}
        rowKeyField="_id"
        totalCount={pagination?.totalCount || 0}
        pageLimit={pagination?.pageLimit || 10}
        onPaginationChange={handlePaginationChange}
      />

      <GlobalDrawer
        title={`${initialValues._id ? 'Edit' : 'Add'} ${config.title}`}
        open={drawerVisible}
        onClose={createLoading || updateLoading ? () => {} : resetForm}
        width={drawerWidth}
      >
        <AntdForm
          form={form}
          formItems={formItems}
          formColumns={formColumns}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          onValuesChange={onValuesChange}
          loading={createLoading || updateLoading}
        />
      </GlobalDrawer>
    </div>
  );
};
