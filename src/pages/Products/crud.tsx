import React from "react";
import CrudModule from "../../components/common/CrudModule";
import { getApiRouteProduct } from "../../helpers/Common_functions";
import { Input, Select, Switch, Tag } from "antd";
import { Option } from "antd/es/mentions";
const ProductCrud = () => {
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
      label: "Variant",
      name: "variant",
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
  const columns = [
    { title: "name", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  const apiRoutes = {
    get: getApiRouteProduct("GetAll"),
    create: getApiRouteProduct("Create"),
    update: getApiRouteProduct("Update"),
    delete: getApiRouteProduct("Delete"),
  };

  return (
    <CrudModule
      title="Products"
      formItems={formItems}
      columns={columns}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default ProductCrud;
