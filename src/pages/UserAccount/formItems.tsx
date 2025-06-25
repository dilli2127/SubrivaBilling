import React from 'react';
import {  Input,  Select,  Switch } from 'antd';

export const usersAccountFormItems = (roles: {label: string; value: string}[] = []) => [
  {
    label: "Full Name",
    name: "name",
    rules: [{ required: true, message: "Please enter full name" }],
    component: <Input placeholder="Enter full name" />,
  },
  {
    label: "Email",
    name: "email",
    rules: [
      { required: true, message: "Please enter email" },
      { type: "email", message: "Enter a valid email" },
    ],
    component: <Input placeholder="Enter email" />,
  },
  {
    label: "Username",
    name: "user_name",
    rules: [{ required: true, message: "Please enter username" }],
    component: <Input placeholder="Enter username" />,
  },
  {
    label: "Mobile Number",
    name: "mobile",
    rules: [
      { required: true, message: "Please enter mobile number" },
      { pattern: /^[0-9]{10}$/, message: "Enter valid 10-digit mobile number" },
    ],
    component: <Input placeholder="Enter mobile number" maxLength={10} />,
  },
  {
    label: "Password",
    name: "password",
    rules: [{ required: true, message: "Please enter password" }],
    component: <Input.Password placeholder="Enter password" />,
  },
  {
    label: "Role",
    name: "role_id",
    rules: [{ required: true, message: "Please select a role" }],
    component: (
      <Select placeholder="Select role" allowClear showSearch>
        {roles.map((role) => (
          <Select.Option key={role.value} value={role.value}>
            {role.label}
          </Select.Option>
        ))}
      </Select>
    ),
  },
  {
    label: "Active Status",
    name: "status",
    valuePropName: "checked",
    component: <Switch checkedChildren="Active" unCheckedChildren="Inactive" />,
  },
]; 