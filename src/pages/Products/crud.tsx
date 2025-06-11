import React from "react";
import CrudModule from "../../components/common/CrudModule";
import { getApiRouteCategory } from "../../helpers/Common_functions";
import { Input, InputNumber, Select, Switch } from "antd";
import { Option } from "antd/es/mentions";
const UnitCrud = () => {
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
  const columns = [
    { title: "Name", dataIndex: "category_name", key: "category_name" },
    { title: "HSN Code", dataIndex: "hsn_code", key: "hsn_code" },
     { title: "Tax Percentage", dataIndex: "tax_percentage", key: "tax_percentage" },
  ];

  const apiRoutes = {
    get: getApiRouteCategory("Get"),
    create: getApiRouteCategory("Create"),
    update: getApiRouteCategory("Update"),
    delete: getApiRouteCategory("Delete"),
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

export default UnitCrud;
