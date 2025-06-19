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
import {
  EyeOutlined,
  DeleteOutlined,
  PrinterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import GlobalDrawer from "../../components/antd/GlobalDrawer";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import RetailBillingTable from "./retaill_bill";
import BillViewModal from "./components/BillViewModal";
import GlobalTable from "../../components/antd/GlobalTable";
import { handleApiResponse } from "../../components/common/handleApiResponse";

const { Title } = Typography;
const { Option } = Select;

const BillListPage = () => {
  const { SalesRecord } = useApiActions();
  const { items: RetailBillList, loading } = useDynamicSelector(
    SalesRecord.getIdentifier("GetAll")
  );
  const { items: deleteItems, loading: deleteLoading } = useDynamicSelector(
    SalesRecord.getIdentifier("GetAll")
  );

  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [billViewVisible, setBillViewVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const handleDelete = async (id: string) => {
    try {
      await SalesRecord("Delete", {}, id);
      const success = deleteItems?.statusCode === "200";
      handleApiResponse({
        action: "delete",
        success,
        title: "Sale",
        getAllItems: () =>
          SalesRecord("GetAll", {
            pageNumber: pagination.current,
            pageLimit: pagination.pageSize,
          }),
      });
    } catch (error) {
      handleApiResponse({
        action: "delete",
        success: false,
        title: "Sale",
      });
    }
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
    };

    setSelectedBill(formattedBill);
    setBillViewVisible(true);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 }); // Reset to first page on search
    SalesRecord("GetAll", {
      pageNumber: 1,
      pageLimit: pagination.pageSize,
      searchString: value,
    });
  };

  const handlePaginationChange = (pageNumber: number, pageLimit: number) => {
    setPagination({ current: pageNumber, pageSize: pageLimit });
    SalesRecord("GetAll", {
      pageNumber,
      pageLimit,
      searchString: searchText,
    });
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
      render: (customerDetails: any) => (
        <>{`${customerDetails?.full_name} - ${customerDetails?.mobile}`}</>
      ),
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
            onConfirm={() => handleDelete(record._id)}
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
    SalesRecord("GetAll", {
      pageNumber: pagination.current,
      pageLimit: pagination.pageSize,
      searchString: searchText,
    });
  }, [SalesRecord]);

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
          Sales List
        </Title>
        <Space>
          <Input
            placeholder="Search by invoice no, customer name or mobile"
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 300 }}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedBill(null);
              setIsDrawerOpen(true);
            }}
          >
            Create New Sale
          </Button>
        </Space>
      </div>

      <GlobalTable
        data={RetailBillList?.result}
        columns={columns}
        loading={loading}
        bordered
        rowKey="_id"
        totalCount={RetailBillList?.pagination?.totalCount || 0}
        pageLimit={RetailBillList?.pagination?.pageLimit || 0}
        onPaginationChange={handlePaginationChange}
      />

      <GlobalDrawer
        title={selectedBill ? "Edit Sale" : "Create New Sale"}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={1200}
      >
        <RetailBillingTable
          billdata={selectedBill}
          onSuccess={() => {
            setIsDrawerOpen(false);
            SalesRecord("GetAll");
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
