import React from 'react';
import { Button, Row, Input, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGenericCrud, CrudConfig } from '../../hooks/useGenericCrud';
import { BaseEntity } from '../../types/entities';
import GlobalDrawer from '../antd/GlobalDrawer';
import AntdForm from '../antd/form/form';
import GlobalTable from '../antd/GlobalTable';

interface GenericCrudPageProps<T extends BaseEntity> {
  config: CrudConfig<T>;
}

export const GenericCrudPage = <T extends BaseEntity>({ config }: GenericCrudPageProps<T>) => {
  const {
    loading,
    items,
    drawerVisible,
    searchText,
    initialValues,
    form,
    setSearchText,
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h1>{config.title}</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Input
            placeholder={`Search ${config.title}`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={handleDrawerOpen}>
            Add {config.title}
          </Button>
        </div>
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