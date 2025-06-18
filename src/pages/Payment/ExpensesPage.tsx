import React from "react";
import CrudModule from "../../components/common/CrudModule";
import {
  getApiRouteExpenses,
  getApiRoutePaymentHistory,
  getApiRouteVariant,
} from "../../helpers/Common_functions";
import { DatePicker, Input, InputNumber, Select } from "antd";
import { Option } from "antd/es/mentions";
import {
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  TagsOutlined,
} from "@ant-design/icons";
const ExpensesCrud = () => {
  const formItems = [
    {
      name: "title",
      label: "Expense Title",
      rules: [{ required: true, message: "Please enter the expense title" }],
      component: (
        <Input
          prefix={<FileTextOutlined />}
          placeholder="e.g., Electricity Sale"
        />
      ),
    },
    {
      name: "amount",
      label: "Amount",
      rules: [{ required: true, message: "Please enter the amount" }],
      component: (
        <InputNumber
          prefix={<DollarOutlined />}
          placeholder="e.g., 500"
          style={{ width: "100%" }}
          min={0}
        />
      ),
    },
    {
      name: "date",
      label: "Date",
      rules: [{ required: true, message: "Please select a date" }],
      component: (
        <DatePicker
          placeholder="Select expense date"
          style={{ width: "100%" }}
          suffixIcon={<CalendarOutlined />}
        />
      ),
    },
    {
      name: "category",
      label: "Category",
      rules: [{ required: true, message: "Please select category" }],
      component: (
        <Select
          placeholder="Select category"
          suffixIcon={<TagsOutlined />}
          allowClear
        >
          <Option value="utilities">Utilities</Option>
          <Option value="maintenance">Maintenance</Option>
          <Option value="supplies">Supplies</Option>
          <Option value="salary">Salary</Option>
          <Option value="others">Others</Option>
        </Select>
      ),
    },
    {
      name: "notes",
      label: "Notes",
      rules: [],
      component: <Input.TextArea rows={3} placeholder="Additional notes" />,
    },
  ];
  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
     { title: "Notes", dataIndex: "notes", key: "notes" },
  ];

  const apiRoutes = {
    get: getApiRouteExpenses("GetAll"),
    create: getApiRouteExpenses("Create"),
    update: getApiRouteExpenses("Update"),
    delete: getApiRouteExpenses("Delete"),
  };

  return (
    <CrudModule
      title="Expenses"
      formItems={formItems}
      columns={columns}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default ExpensesCrud;
