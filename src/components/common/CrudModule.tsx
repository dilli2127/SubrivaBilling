// components/common/CrudModule.tsx

import React, { memo } from "react";
import { Button, Row, Input, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGenericCrud, CrudConfig } from "../../hooks/useGenericCrud";
import { BaseEntity } from "../../types/entities";
import GlobalDrawer from "../antd/GlobalDrawer";
import AntdForm from "../antd/form/form";
import GlobalTable from "../antd/GlobalTable";

interface CrudModuleProps<T extends BaseEntity> {
  title: string;
  columns: any[];
  formItems: any[];
  apiRoutes: {
    get: any;
    create: any;
    update: any;
    delete: any;
  };
  formColumns?: number;
  drawerWidth?: number;
}

const CrudModule = <T extends BaseEntity>({
  title,
  columns,
  formItems,
  apiRoutes,
  formColumns = 2,
  drawerWidth,
}: CrudModuleProps<T>) => {
  const config: CrudConfig<T> = {
    title,
    columns,
    formItems,
    apiRoutes,
    formColumns,
    drawerWidth,
  };

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
  } = useGenericCrud(config);

  const tableColumns = [
    ...columns,
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: T) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Tooltip title="Edit">
            <EditOutlined
              style={{ cursor: "pointer", color: "#1890ff" }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined
              style={{ cursor: "pointer", color: "red" }}
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
        <h1>{title}</h1>
        <div style={{ display: "flex", gap: "16px" }}>
          <Input
            placeholder={`Search ${title}`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={handleDrawerOpen}>
            Add {title}
          </Button>
        </div>
      </Row>

      <GlobalTable
        columns={tableColumns}
        data={items}
        rowKeyField="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <GlobalDrawer
        title={`${initialValues._id ? 'Edit' : 'Add'} ${title}`}
        onClose={resetForm}
        open={drawerVisible}
        width={drawerWidth || 600}
      >
        <AntdForm
          form={form}
          initialValues={initialValues}
          formItems={formItems}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          formColumns={formColumns}
        />
      </GlobalDrawer>
    </div>
  );
};

export default memo(CrudModule);
