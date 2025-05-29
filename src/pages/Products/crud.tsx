import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Row,
  Drawer,
  Input,
  InputNumber,
  Upload,
  Form,
  Tooltip,
  Image,
  Switch,
  Select,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useFileUpload } from "../../helpers/useFileUpload";
import AntdForm from "../../components/antd/form/form";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { ApiRequest } from "../../services/api/apiService";
import {
  dynamic_clear,
  dynamic_request,
  useDynamicSelector,
} from "../../services/redux";
import { getApiRouteCmsImage, showToast } from "../../helpers/Common_functions";
import { API_ROUTES } from "../../services/api/utils";

const formColumns = 2;
const { Option } = Select;
const ProductCrud: React.FC = () => {
  const getRoute = getApiRouteCmsImage("Get");
  const addRoute = getApiRouteCmsImage("Create");
  const updateRoute = getApiRouteCmsImage("Update");
  const deleteRoute = getApiRouteCmsImage("Delete");
  const [form] = Form.useForm();
  const dispatch: Dispatch<any> = useDispatch();
  const { handleFileUpload } = useFileUpload();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [initialValues, setInitialValues] = useState<{
    _id?: string;
    url?: string;
  } | null>({});
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const { items: updateItems, error: updateError } = useDynamicSelector(
    updateRoute.identifier
  );
  const { items: deleteItems, error: deleteError } = useDynamicSelector(
    deleteRoute.identifier
  );
  const { items: createItems, error: createError } = useDynamicSelector(
    addRoute.identifier
  );
  const [InviteUrl, setInviteUrl] = useState<string[]>([]);
  const callBackServer = useCallback(
    (variables: ApiRequest, key: string) => {
      dispatch(dynamic_request(variables, key));
    },
    [dispatch]
  );
  const { loading, items } = useDynamicSelector(getRoute.identifier);
  const columns = [
    { title: "Invite Name", dataIndex: "invite_name", key: "invite_name" },
    {
      title: "Image",
      dataIndex: "invite_url",
      key: "invite_url",
      render: (url: string) =>
        url ? (
          <Image
            src={url}
            alt="image"
            style={{ width: 100, height: 100, objectFit: "cover" }}
          />
        ) : (
          "No Image"
        ),
    },
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
      label: "Product Name",
      name: "name",
      rules: [{ required: true, message: "Please enter the product name!" }],
      component: <Input placeholder="e.g., HP Toner 85A" />,
    },
    {
      label: "Category",
      name: "category",
      rules: [{ required: true, message: "Please select a category!" }],
      component: (
        <Select placeholder="Select category">
          <Option value="electronics">Electronics</Option>
          <Option value="stationery">Stationery</Option>
          <Option value="services">Services</Option>
        </Select>
      ),
    },
    {
      label: "SKU / Code",
      name: "sku",
      rules: [{ required: false }],
      component: <Input placeholder="Optional SKU code" />,
    },
    {
      label: "Price",
      name: "price",
      rules: [{ required: true, message: "Please enter price!" }],
      component: <InputNumber min={0} style={{ width: "100%" }} />,
    },
    {
      label: "Cost Price",
      name: "cost_price",
      rules: [{ required: false }],
      component: <InputNumber min={0} style={{ width: "100%" }} />,
    },
    {
      label: "Tax (%)",
      name: "tax_percentage",
      rules: [],
      component: <InputNumber min={0} max={100} style={{ width: "100%" }} />,
    },
    {
      label: "Unit",
      name: "unit",
      rules: [{ required: true, message: "Please enter unit!" }],
      component: (
        <Select placeholder="Select unit">
          <Option value="pcs">pcs</Option>
          <Option value="box">box</Option>
          <Option value="kg">kg</Option>
          <Option value="liter">liter</Option>
        </Select>
      ),
    },
    {
      label: "Barcode",
      name: "barcode",
      rules: [],
      component: <Input placeholder="Optional barcode" />,
    },
    // {
    //   label: "Image",
    //   name: "image",
    //   valuePropName: "fileList",
    //   getValueFromEvent: (e) => (Array.isArray(e) ? e : e?.fileList),
    //   component: (
    //     <Upload name="image" listType="picture" maxCount={1}>
    //       <button type="button">
    //         <UploadOutlined /> Upload
    //       </button>
    //     </Upload>
    //   ),
    // },
    {
      label: "Status",
      name: "status",
      valuePropName: "checked",
      rules: [],
      component: (
        <Switch
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          defaultChecked
        />
      ),
    },
  ];
  const getAllInvites = () => {
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
    getAllInvites();
  }, []);
  const handleApiResponse = (
    action: "create" | "update" | "delete",
    success: boolean
  ) => {
    if (success) {
      showToast("success", `Image ${action}d successfully`);
      getAllInvites();
      resetForm();
      const actionRoute = getApiRouteCmsImage(
        (action.charAt(0).toUpperCase() +
          action.slice(1)) as keyof typeof API_ROUTES.GetEivite
      );
      dispatch(dynamic_clear(actionRoute.identifier));
    } else {
      showToast("error", `Failed to ${action} image`);
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
  const handleCustomUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      const uploadedImageUrl = await handleFileUpload(file);

      if (uploadedImageUrl) {
        setUploadedImageUrls((prev) => {
          const updatedUrls = [...prev, uploadedImageUrl];
          form.setFieldsValue({ images: updatedUrls });
          return updatedUrls;
        });

        onSuccess?.(uploadedImageUrl);
      } else {
        onError?.(new Error("File upload failed"));
      }
    } catch (err) {
      onError?.(new Error("File upload failed"));
    }
  };

  const handleRemove = (file: any) => {
    setUploadedImageUrls((prev) => {
      const updatedUrls = prev.filter((url) => url !== file.url);
      form.setFieldsValue({ images: updatedUrls });
      return updatedUrls;
    });
  };

  const handleDrawerOpen = () => setDrawerVisible(true);

  const FormValue = (values: any) => {
    delete values.nestedItems;
    delete values.image;
    const finalData = {
      ...values,
      images: uploadedImageUrls,
      invite_url: InviteUrl,
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
    setUploadedImageUrls([]);
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
        <h1>Products List</h1>
        <div style={{ display: "flex", gap: "16px" }}>
          <Input
            placeholder="Search Products"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={handleDrawerOpen}>
            Add Products
          </Button>
        </div>
      </Row>

      <Table columns={columns} dataSource={items?.result} rowKey="id" />

      <Drawer
        title="Add New Produts"
        placement="right"
        onClose={resetForm}
        open={drawerVisible}
        width={600}
        bodyStyle={{
          background: "linear-gradient(135deg, rgb(231 235 255), rgb(218 183 253))",
          color: "white",
          padding: "24px",
        }}
      >
        <AntdForm
          form={form}
          initialValues={initialValues}
          formItems={formItems}
          FormValue={FormValue}
          formColumns={formColumns}
          onChildCancel={resetForm}
        />
      </Drawer>
    </div>
  );
};

export default memo(ProductCrud);
