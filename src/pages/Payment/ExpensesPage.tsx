import React from "react";
import { GenericCrudPage } from "../../components/common/GenericCrudPage";
import { DatePicker, Input, InputNumber, Select, Tag, Tooltip } from "antd";
import { Option } from "antd/es/mentions";
import {
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { getEntityApiRoutes } from "../../helpers/CrudFactory";
import dayjs from "dayjs";

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
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => (
        <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
          <FileTextOutlined style={{ color: "#1890ff" }} />
          {text}
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string) => (
        <Tag color={category === "Income" ? "green" : "volcano"}>{category}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <span>
          <CalendarOutlined style={{ color: "#faad14", marginRight: 4 }} />
          {dayjs(date).format("DD MMM YYYY")}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <span style={{ fontWeight: 500 }}>
          <DollarOutlined style={{ color: "#52c41a", marginRight: 4 }} />
          ₹{amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => (
        <Tooltip title={notes}>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150, display: "inline-block" }}>
            {notes}
          </span>
        </Tooltip>
      ),
    },
  ];
  const apiRoutes = getEntityApiRoutes("Expenses");

  const config = {
    title: "Expenses",
    columns,
    formItems,
    apiRoutes,
    formColumns: 2,
  };
  return (
    <GenericCrudPage 
      config={config}
      enableDynamicFields={true}
      entityName="expenses"
    />
  );
};

export default ExpensesCrud;
