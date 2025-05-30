import React, { useState } from "react";
import {
  Table,
  Input,
  InputNumber,
  Button,
  Form,
  DatePicker,
  Select,
  Row,
  Col,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { DeleteOutlined } from "@ant-design/icons";
const { Title } = Typography;
const { Option } = Select;

const RetailBillingTable = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([
    { key: 0, name: "", qty: 1, price: 0, amount: 0 },
  ]);
  const [count, setCount] = useState(1);

  const products = [
    { label: "Paracetamol 500mg", value: "paracetamol" },
    { label: "Wheat 1kg", value: "wheat" },
    { label: "Sugar 1kg", value: "sugar" },
    { label: "Shampoo 100ml", value: "shampoo" },
  ];

  type DataSourceItem = {
    key: number;
    name: string;
    qty: number;
    price: number;
    amount: number;
  };
  type EditableColumn = "name" | "qty" | "price";

  const handleChange = (value: any, key: number, column: EditableColumn) => {
    const newData = [...dataSource];
    const item = newData.find((item) => item.key === key);
    if (!item) return;
    if (column === "name") {
      item.name = value;
    } else if (column === "qty") {
      item.qty = value;
      item.amount = (item.qty || 1) * (item.price || 0);
    } else if (column === "price") {
      item.price = value;
      item.amount = (item.qty || 1) * (item.price || 0);
    }
    setDataSource(newData);
  };

  const handleAdd = () => {
    setDataSource([
      ...dataSource,
      { key: count, name: "", qty: 1, price: 0, amount: 0 },
    ]);
    setCount(count + 1);
  };
  const handleDelete = (key: number) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const columns = [
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Add Item</span>
      ),
      dataIndex: "additem",
      width: 180,
      render: (_: any, record: DataSourceItem, index: number) => (
        <div style={{ display: "flex", gap: 8 }}>
          {dataSource.length > 1 && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.key)}
            />
          )}
          {index === dataSource.length - 1 && (
            <Button
              type="dashed"
              onClick={handleAdd}
              style={{
                borderColor: "#1890ff",
                color: "#1890ff",
                fontWeight: "bold",
                fontSize: 16,
                minWidth: 100,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#e6f7ff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "transparent";
              }}
            >
              + Add
            </Button>
          )}
        </div>
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Item Name</span>
      ),
      dataIndex: "name",
      render: (_: any, record: DataSourceItem) => (
        <Select
          value={record.name}
          onChange={(value) => handleChange(value, record.key, "name")}
          showSearch
          style={{ width: "100%" }}
          placeholder="Select Product"
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.children)
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
          dropdownStyle={{ maxHeight: 150, overflowY: "auto" }}
        >
          {products.map((product) => (
            <Option key={product.value} value={product.label}>
              {product.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: <span style={{ color: "#1890ff", fontWeight: "bold" }}>Qty</span>,
      dataIndex: "qty",
      width: 100,
      render: (_: any, record: DataSourceItem) => (
        <InputNumber
          min={1}
          value={record.qty}
          onChange={(value) => handleChange(value, record.key, "qty")}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Price</span>
      ),
      dataIndex: "price",
      width: 120,
      render: (_: any, record: DataSourceItem) => (
        <InputNumber
          min={0}
          value={record.price}
          onChange={(value) => handleChange(value, record.key, "price")}
          style={{ width: "100%" }}
          formatter={(value) =>
            `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => Number(value!.replace(/₹\s?|(,*)/g, ""))}
        />
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Amount</span>
      ),
      dataIndex: "amount",
      width: 140,
      render: (_: any, record: DataSourceItem) => (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>
          ₹ {record.amount.toFixed(2)}
        </span>
      ),
    },
  ];

  const totalAmount = dataSource.reduce((sum, item) => sum + item.amount, 0);

  return (
    
    <Form
      form={form}
      layout="vertical"
      initialValues={{ date: dayjs(), payment_mode: "cash" }}
      style={{
        margin: "auto",
        background: "#f0f5ff",
        padding: 24,
        borderRadius: 10,
        boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
      }}
    > <Title level={3} style={{ color: "#1890ff", textAlign: "center" }}>
          Create Invoice
        </Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Form.Item
            label="Date"
            name="date"
            initialValue={dayjs()}
            style={{ marginBottom: 0 }}
          >
            <DatePicker disabled style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Invoice Number"
            name="invoice_no"
            rules={[{ required: true, message: "Invoice number is required" }]}
            style={{ marginBottom: 0 }}
          >
            <Input
              placeholder="Enter invoice number"
              style={{ borderColor: "#1890ff" }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Form.Item
            label="Customer Mobile"
            name="mobile"
            style={{ marginBottom: 0 }}
          >
            <Input
              maxLength={10}
              placeholder="Enter mobile number"
              style={{ borderColor: "#1890ff" }}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Payment Mode"
            name="payment_mode"
            style={{ marginBottom: 0 }}
          >
            <Select style={{ borderColor: "#1890ff" }}>
              <Option value="cash">Cash</Option>
              <Option value="upi">UPI</Option>
              <Option value="card">Card</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        rowClassName={() => "custom-row"}
        footer={() => (
          <div
            style={{
              textAlign: "right",
              fontWeight: "bold",
              fontSize: 18,
              color: "#1890ff",
              paddingRight: 16,
            }}
          >
            Total: ₹ {totalAmount.toFixed(2)}
          </div>
        )}
        bordered
      />

      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Button
          type="primary"
          htmlType="submit"
          style={{
            backgroundColor: "#1890ff",
            borderColor: "#1890ff",
            fontWeight: "bold",
            fontSize: 16,
            minWidth: 140,
          }}
        >
          Submit Bill
        </Button>
      </div>

      <style>
        {`
          .custom-row:hover {
            background-color: #bae7ff !important;
            transition: background-color 0.3s ease;
          }
          /* Scrollbar for select dropdown */
          .ant-select-dropdown {
            scrollbar-width: thin;
            scrollbar-color: #1890ff #f0f5ff;
          }
          .ant-select-dropdown::-webkit-scrollbar {
            width: 6px;
          }
          .ant-select-dropdown::-webkit-scrollbar-thumb {
            background-color: #1890ff;
            border-radius: 10px;
          }
        `}
      </style>
    </Form>
  );
};

export default RetailBillingTable;
