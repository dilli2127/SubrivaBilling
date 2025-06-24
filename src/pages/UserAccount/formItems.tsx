import React from 'react';
import {  Input,  Select,  Switch } from 'antd';

export const usersAccountFormItems = [
  {
    label: "Full Name",
    name: "full_name",
    rules: [{ required: true, message: "Please enter full name!" }],
    component: <Input placeholder="Enter full name" />,
  },
  {
    label: "Username",
    name: "username",
    rules: [{ required: true, message: "Enter a unique username!" }],
    component: <Input placeholder="Enter username" />,
  },
  {
    label: "Password",
    name: "password",
    rules: [{ required: true, message: "Please enter a password!" }],
    component: <Input.Password placeholder="Enter password" />,
  },
  {
    label: "Email",
    name: "email",
    rules: [{ type: "email", message: "Enter a valid email!" }],
    component: <Input placeholder="Enter email" />,
  },
  {
    label: "Phone",
    name: "phone",
    component: <Input placeholder="Enter phone number" />,
  },
  {
    label: "Branch",
    name: "branch_id",
    rules: [{ required: true, message: "Please select a branch!" }],
    component: (
      <Select placeholder="Select branch">
        {/* Populate dynamically from API */}
      </Select>
    ),
  },
  {
    label: "Role",
    name: "role",
    component: (
      <Select placeholder="Select role" defaultValue="sales_user">
        <Select.Option value="sales_user">Sales User</Select.Option>
        <Select.Option value="admin">Admin</Select.Option>
      </Select>
    ),
  },
  {
    label: "Status",
    name: "status",
    valuePropName: "checked",
    component: <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />,
  },
]; 