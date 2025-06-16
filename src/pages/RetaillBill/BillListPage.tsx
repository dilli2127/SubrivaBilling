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
import { EyeOutlined, DeleteOutlined, PrinterOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import GlobalDrawer from "../../components/antd/GlobalDrawer";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import RetailBillingTable from "./retaill_bill";  
import BillViewModal from "./components/BillViewModal";
import GlobalTable from "../../components/antd/GlobalTable";

const { Title } = Typography;
const { Option } = Select;

const BillListPage = () => {
  const { RetailBill } = useApiActions();
  const { items: RetailBillList, loading } = useDynamicSelector(
    RetailBill.getIdentifier("GetAll")
  );

  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [billViewVisible, setBillViewVisible] = useState(false);
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

  const handlePrint = (record: any) => {
    const formattedBill = {
      ...record,
      items: record.Items?.map((item: any) => ({
        ...item,
        product: record.productDetails?.find((p: any) => p._id === item.product_id),
        qty: item.qty,
        price: item.price,
        amount: item.amount,
        loose_qty: item.loose_qty || 0
      })) || [],
      customer: record.customerDetails,
      total_amount: record.total_amount,
      is_paid: record.is_paid,
      is_partially_paid: record.is_partially_paid,
      paid_amount: record.paid_amount
    };
    
    setSelectedBill(formattedBill);
    setBillViewVisible(true);
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
      render: (total_amount: any) => `₹ ${Number(total_amount).toFixed(2)}`,
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
          <Button
            type="link"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record)}
          >
            Print
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
          Bill List
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedBill(null);
            setIsDrawerOpen(true);
          }}
        >
          Create New Bill
        </Button>
      </div>

      <GlobalTable
        data={RetailBillList?.result}
        columns={columns}
        loading={loading}
        bordered
        rowKey="_id"
      />

      <GlobalDrawer
        title={selectedBill ? "Edit Bill" : "Create New Bill"}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={1600}
      >
        <RetailBillingTable 
          billdata={selectedBill} 
          onSuccess={() => {
            setIsDrawerOpen(false);
            RetailBill("GetAll");
          }}
        />
      </GlobalDrawer>

      {selectedBill && (
        <BillViewModal
          visible={billViewVisible}
          onClose={() => setBillViewVisible(false)}
          billData={selectedBill}
        />
      )}
    </div>
  );
};

export default BillListPage;
