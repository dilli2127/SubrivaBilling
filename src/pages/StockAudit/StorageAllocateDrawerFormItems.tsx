import React from "react";
import { Select, InputNumber } from "antd";

const { Option } = Select;

export const storageAllocateDrawerFormItems = (
  rackList: any,
  rackLoading: boolean
) => [
  {
    name: "rack_id",
    label: "Rack",
    rules: [{ required: true, message: "Please select a rack" }],
    component: (
      <Select
        placeholder="Select rack"
        loading={rackLoading}
        showSearch
        optionFilterProp="children"
      >
        {rackList?.map((rack: any) => (
          <Option key={rack._id} value={rack._id}>
            {rack.name}
          </Option>
        ))}
      </Select>
    ),
  },
  {
    name: "storage_quantity",
    label: "Storage Quantity",
    rules: [{ required: true, message: "Please enter quantity" }],
    component: <InputNumber min={1} style={{ width: "100%" }} />,
  },
  // {
  //   name: "loose_quantity",
  //   label: "Loose Quantity",
  //   rules: [{ required: true, message: "Please enter loose quantity" }],
  //   component: <InputNumber min={0} style={{ width: "100%" }} />,
  // },
]; 