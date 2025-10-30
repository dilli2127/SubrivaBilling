import { Input, InputNumber, Select, DatePicker, Switch } from "antd";
import dayjs from "dayjs";

export const tenantAccountFormItems = [
  {
    label: "Name",
    name: "contact_name",
    rules: [{ required: true, message: "Please input!" }],
    component: <Input />,
  },
  {
    label: "Email",
    name: "email",
    rules: [
      { required: true, message: "Please enter email!" },
      { type: "email", message: "Enter a valid email!" },
    ],
    component: <Input placeholder="Enter email" />,
  },
  {
    label: "Mobile",
    name: "mobile",
    rules: [{ required: true, message: "Please enter mobile number!" }],
    component: <Input placeholder="Enter mobile number" />,
  },
  {
    label: "Password",
    name: "password",
    rules: [{ required: true, message: "Please enter password!" }],
    component: <Input.Password placeholder="Enter password" />,
  },
  {
    label: "Plan Type",
    name: "plan_type",
    rules: [{ required: true, message: "Please select plan type!" }],
    component: (
      <Select
        placeholder="Select plan type"
        options={[
          { label: "Starter", value: "starter" },
          { label: "Standard", value: "standard" },
          { label: "Pro", value: "pro" },
        ]}
      />
    ),
  },
  {
    label: "Max Organisations",
    name: "max_organisations",
    rules: [{ required: true, message: "Please enter allowed organisations!" }],
    component: <InputNumber min={1} style={{ width: "100%" }} />,
  },
  {
    label: "Max Branches",
    name: "max_branches",
    rules: [{ required: true, message: "Please enter allowed branches!" }],
    component: <InputNumber min={1} style={{ width: "100%" }} />,
  },
  {
    label: "Max Users",
    name: "max_users",
    rules: [{ required: true, message: "Please enter allowed users!" }],
    component: <InputNumber min={1} style={{ width: "100%" }} />,
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
    label: "License Start",
    name: "license_start",
    initialValue: dayjs(),
    rules: [{ required: true, message: "Please select license start date!" }],
    component: <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />,
  },
  {
    label: "License Expiry",
    name: "license_expiry",
    initialValue: dayjs().add(1, 'year'),
    rules: [{ required: true, message: "Please select license expiry date!" }],
    component: <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />,
  },
  {
    label: "Status",
    name: "status",
    valuePropName: "checked",
    component: <Switch checkedChildren="Active" unCheckedChildren="Inactive" />,
  },
];
