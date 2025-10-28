import React, { useEffect, useState } from "react";
import {
  Button,
  Space,
  Popconfirm,
  Tag,
  Typography,
  Form,
  Input,
  Tooltip,
  Modal,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  PrinterOutlined,
  PlusOutlined,
  SearchOutlined,
  DollarOutlined,
  CreditCardOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MailOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import GlobalDrawer from "../../components/antd/GlobalDrawer";
import BillDataGrid from "./components/BillDataGrid";
import BillViewModal from "./components/BillViewModal";
import GlobalTable from "../../components/antd/GlobalTable";
import { useHandleApiResponse } from "../../components/common/useHandleApiResponse";
import { useGenericCrudRTK } from "../../hooks/useGenericCrudRTK";
import EmailSendModal from "../../components/common/EmailSendModal";
import { billingTemplates } from './templates/registry';

const { Title } = Typography;

const BillListPage = () => {
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [billViewVisible, setBillViewVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [printBill, setPrintBill] = useState<any>(null);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedBillForEmail, setSelectedBillForEmail] = useState<any>(null);

  // RTK Query hooks for SalesRecord
  const salesRecordRTK = useGenericCrudRTK("SalesRecord");
  const { data: SalesRecordData, isLoading: loading, refetch: refetchSalesList } = salesRecordRTK.useGetAll({
    pageNumber: pagination.current,
    pageLimit: pagination.pageSize,
    searchString: searchText,
  });
  const SalesRecordList = SalesRecordData || { result: [], pagination: null };
  const { delete: deleteSale, ...deleteResult } = salesRecordRTK.useDelete();

  useHandleApiResponse({
    action: "delete",
    title: "Sale",
    mutationResult: deleteResult,
    refetch: refetchSalesList,
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteSale(id);
      // You can add extra logic here if needed (e.g., refresh list, close modal)
    } catch (error) {
      // Optionally handle error here if needed, but notification is handled by the hook
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

  const handleEmail = (record: any) => {
    setSelectedBillForEmail(record);
    setEmailModalVisible(true);
  };

  const handlePrint = (record: any) => {
    // Map the sales record to the template's expected format
    const billData = {
      customerName: record.customerDetails?.full_name || '',
      customerAddress: record.customerDetails?.address || '',
      date: record.date,
      invoice_no: record.invoice_no,
      items: (record.Items || []).map((item: any) => ({
        name: [
          item.productItems?.name || item.product_name || '',
          item.productItems?.VariantItem?.variant_name || '',
        ].filter(Boolean).join(' '),
        qty: item.qty,
        price: item.price,
        mrp:item.mrp,
        amount: item.amount,
      })),
      total: record.total_amount || 0,
      total_gst: record.total_gst || 0,
      discount: record.discount || 0,
      discount_type: record.discount_type || '',
      gst_number: record.gst_number || record.organisationItems?.gst_number || '',
    };
    setPrintBill(billData);
    setPrintModalVisible(true);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 }); // Reset to first page on search
    // RTK Query will automatically refetch with new params
  };

  const handlePaginationChange = (pageNumber: number, pageLimit: number) => {
    setPagination({ current: pageNumber, pageSize: pageLimit });
    // RTK Query will automatically refetch with new params
  };

  const columns = [
    {
      title: "Invoice",
      dataIndex: "invoice_no",
      key: "invoice_no",
      render: (text: string) => (
        <Tag icon={<FileTextOutlined />} color="blue">
          {text}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text: string) => (
        <Tooltip title={dayjs(text).format("MMMM D, YYYY")}>
          <Tag icon={<CalendarOutlined />} color="purple">
            {dayjs(text).format("DD MMM YY")}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerDetails",
      key: "customerDetails",
      render: (customerDetails: any) => (
        <Space>
          <UserOutlined />
          <span>
            <strong>{customerDetails?.full_name}</strong>
            <br />
            <small style={{ color: "#999" }}>{customerDetails?.mobile}</small>
          </span>
        </Space>
      ),
    },
    {
      title: "Payment Mode",
      dataIndex: "payment_mode",
      key: "payment_mode",
      render: (mode: string) => {
        const color =
          mode === "cash" ? "green" : mode === "upi" ? "geekblue" : "orange";
        return (
          <Tag icon={<CreditCardOutlined />} color={color}>
            {mode.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount: number) => (
        <Tag icon={<DollarOutlined />} color="gold">
          ₹ {Number(amount).toFixed(2)}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="View Bill">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Send via Email">
            <Button
              type="link"
              icon={<MailOutlined />}
              onClick={() => handleEmail(record)}
            />
          </Tooltip>
          <Tooltip title="Print">
            <Button
              type="link"
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure to delete this bill?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // RTK Query handles fetching automatically with params, no useEffect needed

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
        data={SalesRecordList?.result}
        columns={columns}
        loading={loading}
        bordered
        rowKey="_id"
        totalCount={SalesRecordList?.pagination?.totalCount || 0}
        pageLimit={SalesRecordList?.pagination?.pageLimit || 10}
        onPaginationChange={handlePaginationChange}
      />

      <GlobalDrawer
        title={selectedBill ? "Edit Sale" : "Create New Sale"}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={1200}
      >
        <BillDataGrid
          billdata={selectedBill}
          onSuccess={() => {
            setIsDrawerOpen(false);
            refetchSalesList();
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

      {/* Print Modal for Bill Template */}
      <Modal
        open={printModalVisible}
        onCancel={() => setPrintModalVisible(false)}
        footer={[
          <Button key="print" type="primary" onClick={() => window.print()}>
            Print
          </Button>,
          <Button key="close" onClick={() => setPrintModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
        title={printBill ? `Print Invoice #${printBill.invoice_no}` : 'Print Invoice'}
        centered
      >
        {printBill && (() => {
          const key = localStorage.getItem('billingTemplate');
          const selectedTemplate: 'classic' | 'modern' = (key === 'modern' || key === 'classic') ? key : 'classic';
          const TemplateComponent = billingTemplates[selectedTemplate].component;
          return <TemplateComponent billData={printBill} />;
        })()}
      </Modal>

      {/* Email Send Modal */}
      <EmailSendModal
        visible={emailModalVisible}
        onClose={() => {
          setEmailModalVisible(false);
          setSelectedBillForEmail(null);
        }}
        billData={selectedBillForEmail}
        customerEmail={selectedBillForEmail?.customerDetails?.email}
        customerName={selectedBillForEmail?.customerDetails?.full_name}
      />
    </div>
  );
};

export default BillListPage;