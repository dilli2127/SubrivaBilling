import React, { useState } from 'react';
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

// Filter and Button Config Types
export type FilterConfig = {
  key: string;
  label: string;
  type: 'input' | 'select' | 'date';
  options?: { label: string; value: any }[]; // for select
  placeholder?: string;
  width?: string | number;
};

export type CustomButtonConfig = {
  key: string;
  label: string;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  onClick: () => void;
  icon?: React.ReactNode;
};

interface GenericCrudPageProps<T extends BaseEntity> {
  config: CrudConfig<T>;
  filters?: FilterConfig[];
  onFilterChange?: (values: Record<string, any>) => void;
  customButtons?: CustomButtonConfig[];
}

export const GenericCrudPage = <T extends BaseEntity>({
  config,
  filters = [],
  onFilterChange,
  customButtons = [],
}: GenericCrudPageProps<T>) => {
  const {
    loading,
    items,
    drawerVisible,
    initialValues,
    form,
    handleEdit,
    handleDelete,
    handleDrawerOpen,
    resetForm,
    handleSubmit,
    columns,
    formItems,
    formColumns = 2,
    drawerWidth,
  } = useGenericCrud(config);

  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value: any) => {
    const newValues = { ...filterValues, [key]: value };
    setFilterValues(newValues);
    if (onFilterChange) onFilterChange(newValues);
  };

  const tableColumns = [
    ...columns,
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: T) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Tooltip title={`Edit ${config.title}`}>
            <EditOutlined
              style={{ cursor: 'pointer', color: '#1890ff' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={`Delete ${config.title}`}>
            <DeleteOutlined
              style={{ cursor: 'pointer', color: '#ff4d4f' }}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

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
                  />
                )}
                {filter.type === 'select' && (
                  <Select
                    placeholder={filter.placeholder || filter.label}
                    value={filterValues[filter.key]}
                    onChange={val => handleFilterChange(filter.key, val)}
                    allowClear
                    style={{ width: filter.width || 200 }}
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
              />
            </Col>

            {/* Custom Buttons */}
            {customButtons.map(btn => (
              <Col key={btn.key}>
                <Button
                  type={btn.type || 'default'}
                  onClick={btn.onClick}
                  icon={btn.icon}
                >
                  {btn.label}
                </Button>
              </Col>
            ))}

            {/* Add Button */}
            <Col>
              <Button type="primary" onClick={handleDrawerOpen}>
                Add {config.title}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      <GlobalTable
        columns={tableColumns}
        data={items}
        loading={loading}
        rowKeyField="_id"
      />

      <GlobalDrawer
        title={`${initialValues._id ? 'Edit' : 'Add'} ${config.title}`}
        open={drawerVisible}
        onClose={resetForm}
        width={drawerWidth}
      >
        <AntdForm
          form={form}
          formItems={formItems}
          formColumns={formColumns}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      </GlobalDrawer>
    </div>
  );
};
