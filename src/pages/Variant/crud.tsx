import React from "react";
import CrudModule from "../../components/common/CrudModule";
import { getApiRouteVariant } from "../../helpers/Common_functions";
import { Input, Select } from "antd";
import { Option } from "antd/es/mentions";
const VariantCrud = () => {
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
          <Option value="tablet">Tablet</Option>
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
      label: "Pack Type",
      name: "pack_type",
      rules: [{ required: true, message: "Please select pack type" }],
      component: (
        <Select placeholder="Select pack type">
          <Option value="strip">Strip</Option>
          <Option value="bottle">Bottle</Option>
          <Option value="packet">Packet</Option>
          <Option value="box">Box</Option>
          <Option value="pouch">Pouch</Option>
          <Option value="pack">Pack</Option>
        </Select>
      ),
    },
    {
      label: "Pack Size",
      name: "pack_size",
      rules: [{ required: true, message: "Enter number of items in pack" }],
      component: (
        <Input
          type="number"
          placeholder="e.g., 15 (for 15 tablets in a strip)"
        />
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
    { title: "Name", dataIndex: "variant_name", key: "variant_name" },
    { title: "Unit Type", dataIndex: "unit", key: "unit" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Pack Size", dataIndex: "pack_size", key: "pack_size" },
    { title: "Pack Type", dataIndex: "pack_type", key: "pack_type" },
  ];

  const apiRoutes = {
    get: getApiRouteVariant("GetAll"),
    create: getApiRouteVariant("Create"),
    update: getApiRouteVariant("Update"),
    delete: getApiRouteVariant("Delete"),
  };

  return (
    <CrudModule
      title="Variants"
      formItems={formItems}
      columns={columns}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default VariantCrud;
