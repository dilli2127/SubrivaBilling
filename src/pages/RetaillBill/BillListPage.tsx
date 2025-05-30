import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Tag,
  Typography,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
} from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import GlobalDrawer from "../../components/antd/GlobalDrawer";

const { Title } = Typography;
const { Option } = Select;

const BillListPage = () => {
  const [bills, setBills] = useState([
    {
      key: "1",
      invoiceNo: "INV001",
      date: "2025-05-29",
      mobile: "9876543210",
      paymentMode: "cash",
      totalAmount: 650.0,
    },
    {
      key: "2",
      invoiceNo: "INV002",
      date: "2025-05-28",
      mobile: "9123456789",
      paymentMode: "upi",
      totalAmount: 340.0,
    },
  ]);

  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const handleDelete = (key: string) => {
    setBills((prev) => prev.filter((bill) => bill.key !== key));
    message.success("Bill deleted successfully");
  };

  const handleView = (record: any) => {
    setSelectedBill(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
    });
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = (values: any) => {
    const updatedBill = {
      ...values,
      date: values.date.format("YYYY-MM-DD"),
    };

    setBills((prev) =>
      prev.map((bill) =>
        bill.key === selectedBill.key ? { ...bill, ...updatedBill } : bill
      )
    );
    setIsDrawerOpen(false);
    message.success("Bill updated successfully");
  };

  const columns = [
    {
      title: "Invoice No",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text: string) => dayjs(text).format("DD MMM YYYY"),
    },
    {
      title: "Customer Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      key: "paymentMode",
      render: (mode: string) => {
        const color =
          mode === "cash" ? "green" : mode === "upi" ? "geekblue" : "orange";
        return <Tag color={color}>{mode.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amt: number) => `₹ ${amt.toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure to delete this bill?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: "#1890ff" }}>
        Bill List
      </Title>

      <Table
        dataSource={bills}
        columns={columns}
        bordered
        rowKey="key"
        pagination={{ pageSize: 10 }}
      />

      <GlobalDrawer
        title="Edit Bill"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={handleFormSubmit}>
          <Form.Item
            name="invoiceNo"
            label="Invoice No"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="mobile"
            label="Customer Mobile"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="paymentMode"
            label="Payment Mode"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="cash">Cash</Option>
              <Option value="upi">UPI</Option>
              <Option value="card">Card</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="totalAmount"
            label="Total Amount"
            rules={[{ required: true }]}
          >
            <InputNumber
              prefix="₹"
              style={{ width: "100%" }}
              min={0}
              step={10}
              precision={2}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </GlobalDrawer>
    </div>
  );
};

export default BillListPage;
