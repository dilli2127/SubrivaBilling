import React from 'react';
import {  Input,  Select,  Switch } from 'antd';

export const branchesFormItems = [
  {
    label: "Branch Name",
    name: "branch_name",
    rules: [{ required: true, message: "Please enter branch name!" }],
    component: <Input placeholder="Enter branch name" />,
  },
  {
    label: "Branch Code",
    name: "branch_code",
    rules: [{ required: true, message: "Please enter unique branch code!" }],
    component: <Input placeholder="Enter unique branch code" />,
  },
  {
    label: "Phone",
    name: "phone",
    component: <Input placeholder="Enter phone number" />,
  },
  {
    label: "Email",
    name: "email",
    rules: [{ type: "email", message: "Please enter a valid email!" }],
    component: <Input placeholder="Enter email address" />,
  },
  {
    label: "Address Line 1",
    name: "address1",
    component: <Input placeholder="Address Line 1" />,
  },
  {
    label: "Address Line 2",
    name: "address2",
    component: <Input placeholder="Address Line 2" />,
  },
  {
    label: "City",
    name: "city",
    component: <Input placeholder="Enter city" />,
  },
  {
    label: "State",
    name: "state",
    component: <Input placeholder="Enter state" />,
  },
  {
    label: "Pincode",
    name: "pincode",
    component: <Input placeholder="Enter pincode" />,
  },
  {
    label: "Head Office",
    name: "is_head_office",
    valuePropName: "unchecked",
    component: <Switch checkedChildren="True" unCheckedChildren="False"  />,
  },
  {
    label: "Status",
    name: "status",
    valuePropName: "checked",
    component: <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />,
  },
];
