import React from "react";
import CrudModule from "../../components/common/CrudModule";
import { getApiRouteUnit } from "../../helpers/Common_functions";
import { Input, Select } from "antd";
import { Option } from "antd/es/mentions";
const UnitCrud = () => {
  const formItems = [
    {
      label: "Variant Name",
      name: "variant_name",
      rules: [{ required: true, message: "Please enter variant name" }],
      component: <Input placeholder="e.g., 1kg, 500ml, 10pcs" />,
    },
    {
      label: "Unit Type",
      name: "unit",
      rules: [{ required: true, message: "Please select unit" }],
      component: (
        <Select placeholder="Select unit">
          <Option value="kg">Kilogram (kg)</Option>
          <Option value="g">Gram (g)</Option>
          <Option value="l">Litre (L)</Option>
          <Option value="ml">Millilitre (ml)</Option>
          <Option value="pcs">Pieces (pcs)</Option>
          <Option value="box">Box</Option>
        </Select>
      ),
    },
    {
      label: "Applicable Category",
      name: "category",
      rules: [{ required: true, message: "Please select category" }],
      component: (
        <Select placeholder="Select category">
          <Option value="medical">Medical</Option>
          <Option value="grocery">Grocery</Option>
          <Option value="general">All Shops</Option>
        </Select>
      ),
    },
  ];
  const columns = [
    { title: "Unit Name", dataIndex: "unit_name", key: "unit_name" },
    { title: "Unit Code", dataIndex: "unit_code", key: "unit_code" },
  ];

  const apiRoutes = {
    get: getApiRouteUnit("Get"),
    create: getApiRouteUnit("Create"),
    update: getApiRouteUnit("Update"),
    delete: getApiRouteUnit("Delete"),
  };

  return (
    <CrudModule
      title="Units"
      formItems={formItems}
      columns={columns}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default UnitCrud;
