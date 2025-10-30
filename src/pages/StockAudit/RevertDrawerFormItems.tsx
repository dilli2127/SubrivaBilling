import React from "react";
import { Select, InputNumber } from "antd";

const { Option } = Select;

export const revertDrawerFormItems = (
  branchList: any,
  branchLoading: boolean,
  record: any
) => [
  {
    name: "branch_id",
    label: "Branch",
    rules: [{ required: true, message: "Please select a branch" }],
    component: (
      <Select
        placeholder="Select branch"
        loading={branchLoading}
        showSearch
        optionFilterProp="children"
      >
        {branchList?.map((branch: any) => (
          <Option key={branch._id} value={branch._id}>
            {branch.branch_name}
          </Option>
        ))}
      </Select>
    ),
  },
  {
    name: "available_stock",
    label: "Available Stock",
    rules: [{ required: false, message: "Please enter available stock" }],
    component: (
      <InputNumber
        min={1}
        style={{ width: "100%" }}
        disabled
        value={record?.available_quantity || 0}
      />
    ),
  },
  {
    name: "quantity",
    label: "Quantity",
    rules: [{ required: true, message: "Please enter quantity" }],
    component: <InputNumber min={1} style={{ width: "100%" }} />,
  },
]; 