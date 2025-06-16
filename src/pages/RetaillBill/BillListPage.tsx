import React, { useEffect, useState } from "react";
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
  Result,
} from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import GlobalDrawer from "../../components/antd/GlobalDrawer";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import RetailBillingTable from "./retaill_bill";
import { render } from "@testing-library/react";

const { Title } = Typography;
const { Option } = Select;

const BillListPage = () => {
  const { RetailBill } = useApiActions();
  const { items: RetailBillList, loading } = useDynamicSelector(
    RetailBill.getIdentifier("GetAll")
  );

  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const handleDelete = (key: string) => {
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

    setIsDrawerOpen(false);
    message.success("Bill updated successfully");
  };

  const columns = [
    {
      title: "Invoice No",
      dataIndex: "invoice_no",
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
      title: "Customer",
      dataIndex: "customerDetails",
      key: "customerDetails",
      render: (customerDetails: any) => <>{`${customerDetails?.full_name} - ${customerDetails?.mobile}`}</>,
    },
    {
      title: "Payment Mode",
      dataIndex: "payment_mode",
      key: "paymentMode",
      render: (mode: string) => {
        const color =
          mode === "cash" ? "green" : mode === "upi" ? "geekblue" : "orange";
        return <Tag color={color}>{mode.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (total_amount: any) => `₹ ${total_amount}`,
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
  useEffect(() => {
    RetailBill("GetAll");
  }, [RetailBill]);
  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: "#1890ff" }}>
        Bill List
      </Title>

      <Table
        dataSource={RetailBillList?.result}
        columns={columns}
        loading={loading}
        bordered
        rowKey="key"
        pagination={{ pageSize: 10 }}
      />

      <GlobalDrawer
        title="Edit Bill"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={1200}
      >
        <RetailBillingTable billdata={selectedBill}  />
      </GlobalDrawer>
    </div>
  );
};

export default BillListPage;
