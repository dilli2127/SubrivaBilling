import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Button,
  Row,
  Input,
  Form,
  Tooltip,
  Select,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AntdForm from "../../components/antd/form/form";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { ApiRequest } from "../../services/api/apiService";
import {
  dynamic_clear,
  dynamic_request,
  useDynamicSelector,
} from "../../services/redux";
import { getApiRouteCustomer, showToast } from "../../helpers/Common_functions";
import { API_ROUTES } from "../../services/api/utils";
import GlobalDrawer from "../../components/antd/GlobalDrawer";
import GlobalTable from "../../components/antd/GlobalTable";
const { Title } = Typography;
const formColumns = 2;
const { Option } = Select;
const CustomerCrud: React.FC = () => {
  const getRoute = getApiRouteCustomer("Get");
  const addRoute = getApiRouteCustomer("Create");
  const updateRoute = getApiRouteCustomer("Update");
  const deleteRoute = getApiRouteCustomer("Delete");
  const [form] = Form.useForm();
  const dispatch: Dispatch<any> = useDispatch();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [initialValues, setInitialValues] = useState<{
    _id?: string;
    url?: string;
  } | null>({});
  const { items: updateItems, error: updateError } = useDynamicSelector(
    updateRoute.identifier
  );
  const { items: deleteItems, error: deleteError } = useDynamicSelector(
    deleteRoute.identifier
  );
  const { items: createItems, error: createError } = useDynamicSelector(
    addRoute.identifier
  );
  const callBackServer = useCallback(
    (variables: ApiRequest, key: string) => {
      dispatch(dynamic_request(variables, key));
    },
    [dispatch]
  );
  const { loading, items } = useDynamicSelector(getRoute.identifier);
  const columns = [
    { title: "Name", dataIndex: "full_name", key: "full_name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
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
  ];
  const formItems = [
    {
      name: "full_name",
      label: "Full Name",
      rules: [{ required: true, message: "Please enter full name" }],
      component: (
        <Input prefix={<UserOutlined />} placeholder="Enter full name" />
      ),
    },
    {
      name: "email",
      label: "Email Address",
      rules: [
        { required: true, message: "Please enter email" },
        { type: "email", message: "Please enter valid email" },
      ],
      component: <Input prefix={<MailOutlined />} placeholder="Enter email" />,
    },
    {
      name: "mobile",
      label: "Mobile Number",
      rules: [
        { required: true, message: "Please enter mobile number" },
        { len: 10, message: "Mobile number must be 10 digits" },
      ],
      component: (
        <Input
          prefix={<PhoneOutlined />}
          placeholder="Enter mobile number"
          maxLength={10}
        />
      ),
    },
    {
      name: "address",
      label: "Address",
      rules: [{ required: true, message: "Please enter address" }],
      component: <Input.TextArea placeholder="Enter address" rows={3} />,
    },
    {
      name: "customer_type",
      label: "Customer Type",
      rules: [{ required: true, message: "Please select customer type" }],
      component: (
        <Select placeholder="Select customer type">
          <Option value="regular">Regular</Option>
          <Option value="vip">VIP</Option>
          <Option value="wholesale">Wholesale</Option>
        </Select>
      ),
    },
  ];
  const getAllCustomer = () => {
    callBackServer(
      { method: getRoute.method, endpoint: getRoute.endpoint, data: {} },
      getRoute.identifier
    );
  };
  const handleEdit = (record: any) => {
    setInitialValues(record);
    setDrawerVisible(true);
  };
  const handleDelete = (record: any) => {
    callBackServer(
      {
        method: deleteRoute.method,
        endpoint: `${deleteRoute.endpoint}/${record._id}`,
        data: { _id: record._id },
      },
      deleteRoute.identifier
    );
  };
  const resetForm = () => {
    setDrawerVisible(false);
    setInitialValues({});
    form.resetFields();
  };
  useEffect(() => {
    getAllCustomer();
  }, []);
  const handleApiResponse = (
    action: "create" | "update" | "delete",
    success: boolean
  ) => {
    if (success) {
      showToast("success", `Customer ${action}d successfully`);
      getAllCustomer();
      resetForm();
      const actionRoute = getApiRouteCustomer(
        (action.charAt(0).toUpperCase() +
          action.slice(1)) as keyof typeof API_ROUTES.Customer
      );
      dispatch(dynamic_clear(actionRoute.identifier));
    } else {
      showToast("error", `Failed to ${action} Customer`);
    }
  };

  useEffect(() => {
    if (createItems?.statusCode === "200") handleApiResponse("create", true);
    if (createError) handleApiResponse("create", false);
  }, [createItems, createError]);

  useEffect(() => {
    if (updateItems?.statusCode === "200") handleApiResponse("update", true);
    if (updateError) handleApiResponse("update", false);
  }, [updateItems, updateError]);

  useEffect(() => {
    if (deleteItems?.statusCode === "200") handleApiResponse("delete", true);
    if (deleteError) handleApiResponse("delete", false);
  }, [deleteItems, deleteError]);

  const handleDrawerOpen = () => setDrawerVisible(true);

  const FormValue = (values: any) => {
    delete values.nestedItems;
    delete values.image;
    const finalData = {
      ...values,
    };
    if (initialValues?._id) {
      callBackServer(
        {
          method: updateRoute.method,
          endpoint: `${updateRoute.endpoint}/${initialValues._id}`,
          data: finalData,
        },
        updateRoute.identifier
      );
    } else {
      callBackServer(
        {
          method: addRoute.method,
          endpoint: addRoute.endpoint,
          data: finalData,
        },
        addRoute.identifier
      );
    }
    setDrawerVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <Row
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Title level={3} style={{ marginBottom: 24, color: "#1890ff" }}>
          Customer List
        </Title>
        <div style={{ display: "flex", gap: "16px" }}>
          <Input
            placeholder="Search Customers"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={handleDrawerOpen}>
            Add Customers
          </Button>
        </div>
      </Row>

      <GlobalTable columns={columns} data={items?.result} loading={loading}/>

      <GlobalDrawer
        title="Add New Customer"
        onClose={resetForm}
        open={drawerVisible}
        width={600}
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

export default memo(CustomerCrud);
