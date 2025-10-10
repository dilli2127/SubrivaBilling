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
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGenericCrud, CrudConfig } from '../../hooks/useGenericCrud';
import { BaseEntity } from '../../types/entities';
import GlobalDrawer from '../antd/GlobalDrawer';
import AntdForm from '../antd/form/form';
import GlobalTable from '../antd/GlobalTable';
import { useSuperAdminFilters } from '../../hooks/useSuperAdminFilters';

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
  };
  filters?: FilterConfig[];
  onFilterChange?: (values: Record<string, any>) => void;
  customButtons?: CustomButtonConfig[];
  onValuesChange?: (changed: any, all: any) => void;
  enableSuperAdminFilters?: boolean; // Enable tenant/org/branch dropdowns for superadmin
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <Tooltip title={allowEdit ? `Edit ${title}` : 'No permission to edit'}>
            <EditOutlined
              style={{ 
                cursor: allowEdit ? 'pointer' : 'not-allowed', 
                color: allowEdit ? '#1890ff' : '#d9d9d9',
                opacity: allowEdit ? 1 : 0.5
              }}
              onClick={() => allowEdit && handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={allowDelete ? `Delete ${title}` : 'No permission to delete'}>
            <DeleteOutlined
              style={{ 
                cursor: (deleteLoading || !allowDelete) ? 'not-allowed' : 'pointer', 
                color: (deleteLoading || !allowDelete) ? '#d9d9d9' : '#ff4d4f',
                opacity: (deleteLoading || !allowDelete) ? 0.5 : 1
              }}
              onClick={() => !deleteLoading && allowDelete && handleDelete(record)}
            />
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
}: GenericCrudPageProps<T>) => {
  // SuperAdmin filters hook
  const superAdminFilters = useSuperAdminFilters();
  const isInitialMount = useRef(true);
  
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
    formItems,
    formColumns = 2,
    drawerWidth,
    filterValues,
    setFilterValues,
  } = useGenericCrud(config);

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
    ...columns,
    getActionsColumn(config.title, handleEdit, handleDelete, deleteLoading, config.canEdit, config.canDelete)
  ], [columns, config.title, handleEdit, handleDelete, deleteLoading, config.canEdit, config.canDelete]);

  return (
    <div>
      <Row
        justify="space-between"
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
            
            {enableSuperAdminFilters && (superAdminFilters.isSuperAdmin || superAdminFilters.isTenant) && (
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
            
            {enableSuperAdminFilters && (
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
