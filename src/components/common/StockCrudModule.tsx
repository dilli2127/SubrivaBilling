// components/common/CrudModule.tsx

import React, { useCallback, useEffect, useState, memo } from "react";
import { Button, Row, Input, Tooltip, Form } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import {
  dynamic_clear,
  dynamic_request,
  useDynamicSelector,
} from "../../services/redux";
import GlobalDrawer from "../antd/GlobalDrawer";
import AntdForm from "../antd/form";
import { showToast } from "../../helpers/Common_functions";
import GlobalTable from "../antd/GlobalTable";
import type { Dispatch } from "redux";

const StockCrudModule = ({
  title,
  columns,
  formItems,
  apiRoutes,
  formColumns = 2,
  drawerWidth,
}: {
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
}) => {
  const dispatch: Dispatch<any> = useDispatch();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState<any>({});
  const { items: updateItems, error: updateError } = useDynamicSelector(
    apiRoutes.update.identifier
  );
  const { items: deleteItems, error: deleteError } = useDynamicSelector(
    apiRoutes.delete.identifier
  );
  const { items: createItems, error: createError } = useDynamicSelector(
    apiRoutes.create.identifier
  );
  const { loading, items } = useDynamicSelector(apiRoutes.get.identifier);

  const callBackServer = useCallback(
    (variables: any, key: string) => {
      dispatch(dynamic_request(variables, key));
    },
    [dispatch]
  );

  const getAllItems = () => {
    callBackServer(
      {
        method: apiRoutes.get.method,
        endpoint: apiRoutes.get.endpoint,
        data: {},
      },
      apiRoutes.get.identifier
    );
  };

  useEffect(() => {
    getAllItems();
  }, []);

 const handleEdit = (record: any) => {
  const updatedRecord = {
    ...record,
    mfg_date: record?.mfg_date ? dayjs(record.mfg_date) : null,
    expiry_date: record?.expiry_date ? dayjs(record.expiry_date) : null,
    buyed_date: record?.buyed_date ? dayjs(record.buyed_date) : null,
  };

  setInitialValues(updatedRecord);
  setDrawerVisible(true);
};
  const handleDelete = (record: any) => {
    callBackServer(
      {
        method: apiRoutes.delete.method,
        endpoint: `${apiRoutes.delete.endpoint}/${record._id}`,
        data: { _id: record._id },
      },
      apiRoutes.delete.identifier
    );
  };

  const resetForm = () => {
    setDrawerVisible(false);
    setInitialValues({});
    form.resetFields();
  };

  const handleApiResponse = (
    action: "create" | "update" | "delete",
    success: boolean
  ) => {
    if (success) {
      showToast("success", `${title} ${action}d successfully`);
      getAllItems();
      resetForm();
      dispatch(dynamic_clear(apiRoutes[action].identifier));
    } else {
      showToast("error", `Failed to ${action} ${title}`);
    }
  };

  useEffect(() => {
    if (createItems?.statusCode === 200) handleApiResponse("create", true);
    if (createError) handleApiResponse("create", false);
  }, [createItems, createError]);

  useEffect(() => {
    if (updateItems?.statusCode === 200) handleApiResponse("update", true);
    if (updateError) handleApiResponse("update", false);
  }, [updateItems, updateError]);

  useEffect(() => {
    if (deleteItems?.statusCode === 200) handleApiResponse("delete", true);
    if (deleteError) handleApiResponse("delete", false);
  }, [deleteItems, deleteError]);

  const handleDrawerOpen = () => setDrawerVisible(true);

  const FormValue = (values: any) => {
    const finalData = { ...values };
    if (finalData.buyed_date) {
      finalData.buyed_date = dayjs(finalData.buyed_date).format("YYYY-MM-DD");
    }
    if (finalData.expiry_date) {
      finalData.expiry_date = dayjs(finalData.expiry_date).format("YYYY-MM-DD");
    }
    if (finalData.mfg_date) {
      finalData.mfg_date = dayjs(finalData.mfg_date).format("YYYY-MM-DD");
    }
    finalData.total_cost = values.buy_price * values.quantity
    if (initialValues?._id) {
      callBackServer(
        {
          method: apiRoutes.update.method,
          endpoint: `${apiRoutes.update.endpoint}/${initialValues._id}`,
          data: finalData,
        },
        apiRoutes.update.identifier
      );
    } else {
      callBackServer(
        {
          method: apiRoutes.create.method,
          endpoint: apiRoutes.create.endpoint,
          data: finalData,
        },
        apiRoutes.create.identifier
      );
    }

    form.resetFields();
  };

  const filteredItems = items?.result?.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchText.toLowerCase())
  );

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
        columns={[
          ...columns,
          {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
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
        ]}
        data={filteredItems}
        dataSource={filteredItems}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <GlobalDrawer
        title={`Add New ${title}`}
        onClose={resetForm}
        open={drawerVisible}
        width={drawerWidth || 600}
      >
        <AntdForm
          form={form}
          initialValues={initialValues}
          formItems={formItems}
          FormValue={FormValue}
          formColumns={formColumns}
          onChildCancel={resetForm}
        />
      </GlobalDrawer>
    </div>
  );
};

export default memo(StockCrudModule);
