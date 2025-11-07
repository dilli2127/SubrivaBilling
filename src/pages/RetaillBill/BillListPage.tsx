import React, { useEffect, useState, useMemo } from "react";
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
  Tabs,
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
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ReactDOMServer from 'react-dom/server';
import GlobalDrawer from "../../components/antd/GlobalDrawer";
import BillDataGrid from "./components/BillDataGrid";
import BillViewModal from "./components/BillViewModal";
import GlobalTable from "../../components/antd/GlobalTable";
import { useHandleApiResponse } from "../../components/common/useHandleApiResponse";
import { useGenericCrudRTK } from "../../hooks/useGenericCrudRTK";
import EmailSendModal from "../../components/common/EmailSendModal";
import { useTemplateSettings } from '../../hooks/useTemplateSettings';
import { getCurrentUser } from "../../helpers/auth";
import { apiSlice } from "../../services/redux/api/apiSlice";

const { Title } = Typography;

const BillListPage = () => {
  // Get template settings
  const { BillTemplateComponent, InvoiceTemplateComponent, settings } = useTemplateSettings();
  
  // Get current user data for organization details
  const userItem = useMemo(() => {
    const user = getCurrentUser();
    return user;
  }, []);

  // Fetch organization data from API
  const organisationId = userItem?.organisation_id || userItem?.organisationItems?._id;
  const { data: organisationsData } = apiSlice.useGetOrganisationsQuery(
    { organisation_id: organisationId },
    { skip: !organisationId }
  );

  // Get organization details from API response
  const organisationDetails = useMemo(() => {
    const result = (organisationsData as any)?.result;
    if (Array.isArray(result)) {
      return result[0];
    }
    return result || userItem?.organisationItems || {};
  }, [organisationsData, userItem]);
  
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [billViewVisible, setBillViewVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedBillForEmail, setSelectedBillForEmail] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("completed");

  // RTK Query hooks for SalesRecord
  const salesRecordRTK = useGenericCrudRTK("SalesRecord");
  const { data: SalesRecordData, isLoading: loading, refetch: refetchSalesList } = salesRecordRTK.useGetAll({
    pageNumber: pagination.current,
    pageLimit: pagination.pageSize,
    searchString: searchText,
    status: activeTab === "drafts" ? "draft" : "completed",
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

  // Format bill data for templates
  const formatBillData = (record: any) => {
    // Bills use customerDetails, Invoices use vendorDetails
    const isInvoice = record.document_type === 'invoice';
    const partyDetails = isInvoice ? record.vendorDetails : record.customerDetails;
    
    // If no party details found, log warning and use fallback
    if (!partyDetails) {
      console.warn(`⚠️ Data mismatch: ${isInvoice ? 'Invoice' : 'Bill'} missing ${isInvoice ? 'vendorDetails' : 'customerDetails'}`, record);
    }
    
    return {
      customerName: partyDetails?.vendor_name || partyDetails?.full_name || partyDetails?.name || '',
      customerAddress: partyDetails?.address || partyDetails?.address1 || '',
      customerCity: partyDetails?.city || '',
      customerState: partyDetails?.state || '',
      customerPincode: partyDetails?.pincode || '',
      customerPhone: partyDetails?.phone || partyDetails?.mobile || '',
      customerEmail: partyDetails?.email || '',
      customer_gstin: partyDetails?.gst_no || partyDetails?.gst_number || partyDetails?.gstin || '',
      customer_pan: partyDetails?.pan_no || partyDetails?.pan_number || '',
      date: record.date,
      invoice_no: record.invoice_no,
      items: (record.Items || []).map((item: any) => ({
        name: [
          item.productItems?.name || item.product_name || '',
          item.productItems?.VariantItem?.variant_name || '',
        ].filter(Boolean).join(' '),
        product_name: item.productItems?.name || item.product_name || '',
        qty: item.qty,
        quantity: item.quantity || item.qty,
        price: item.price,
        mrp: item.mrp,
        amount: item.amount,
        hsn_code: item.hsn_code || item.productItems?.hsn_code || item.productItems?.VariantItem?.hsn_code || '',
        hsn_sac: item.hsn_sac || item.productItems?.hsn_sac || '',
        tax_percentage: item.tax_percentage || item.productItems?.CategoryItem?.tax_percentage || item.productItems?.tax_percentage || 0,
        discount: item.discount || 0,
        description: item.description || '',
      })),
      total: record.total_amount || 0,
      total_gst: record.total_gst || 0,
      discount: record.discount || 0,
      discount_type: record.discount_type || '',
      gst_number: record.gst_number || record.organisationItems?.gst_number || organisationDetails?.gst_number || '',
      // Payment status fields
      is_paid: record.is_paid || false,
      is_partially_paid: record.is_partially_paid || false,
      paid_amount: record.paid_amount || 0,
      payment_mode: record.payment_mode || 'Cash',
      // Add organization details - use record data or fallback to API fetched organization data
      organisationItems: record.organisationItems || organisationDetails || userItem?.organisationItems || {},
      branchItems: record.branchItems || userItem?.branchItems || {},
    };
  };

  const handlePrint = async (record: any) => {
    const billData = formatBillData(record);
    
    // Use document_type to determine template (default to 'bill' if not specified)
    const documentType = (record.document_type || 'bill') as 'bill' | 'invoice';
    
    // Generate QR code BEFORE printing if enabled
    let qrCodeDataUrl = '';
    if (settings?.enable_payment_qr && settings?.upi_id) {
      try {
        const { generateUPIQRCode, formatBillToUPIParams } = await import('../../helpers/upiPayment');
        const upiParams = formatBillToUPIParams(billData, settings);
        if (upiParams) {
          qrCodeDataUrl = await generateUPIQRCode(upiParams, { width: settings?.qr_size || 150 });
        }
      } catch (error) {
        console.error('Error pre-generating QR code for print:', error);
      }
    }
    
    // Add QR code to settings
    const enhancedSettings = {
      ...settings,
      qrCodeDataUrl,
    };
    
    // Select appropriate template based on document type
    const TemplateComponent = documentType === 'bill' 
      ? BillTemplateComponent 
      : InvoiceTemplateComponent;

    // Create element and render to HTML
    const element = React.createElement(TemplateComponent, { billData, settings: enhancedSettings });
    const templateHtml = ReactDOMServer.renderToString(element);

    // Import PDF helper and print
    const { printAsPDF } = await import('../../helpers/pdfHelper');
    const fileName = `${documentType}_${billData.invoice_no}_${dayjs().format('YYYYMMDD')}`;
    
    // Print as PDF
    await printAsPDF(templateHtml, fileName, documentType);
  };

  const handleDownload = async (record: any) => {
    const billData = formatBillData(record);
    // Use document_type to determine template (default to 'bill' if not specified)
    const documentType = (record.document_type || 'bill') as 'bill' | 'invoice';
    
    // Generate QR code BEFORE rendering if enabled
    let qrCodeDataUrl = '';
    if (settings?.enable_payment_qr && settings?.upi_id) {
      try {
        const { generateUPIQRCode, formatBillToUPIParams } = await import('../../helpers/upiPayment');
        const upiParams = formatBillToUPIParams(billData, settings);
        if (upiParams) {
          qrCodeDataUrl = await generateUPIQRCode(upiParams, { width: settings?.qr_size || 150 });
        }
      } catch (error) {
        console.error('Error pre-generating QR code for download:', error);
      }
    }
    
    // Add QR code to settings
    const enhancedSettings = {
      ...settings,
      qrCodeDataUrl, // Pass pre-generated QR code
    };
    
    // Select appropriate template based on document type
    const TemplateComponent = documentType === 'bill' 
      ? BillTemplateComponent 
      : InvoiceTemplateComponent;

    // Create element and render to HTML
    const element = React.createElement(TemplateComponent, { billData, settings: enhancedSettings });
    const templateHtml = ReactDOMServer.renderToString(element);

    // Import PDF helper
    const { downloadAsPDF } = await import('../../helpers/pdfHelper');
    const fileName = `${documentType}_${billData.invoice_no}_${dayjs().format('YYYYMMDD')}`;
    
    // Download as PDF
    await downloadAsPDF(templateHtml, fileName, documentType);
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

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPagination({ current: 1, pageSize: pagination.pageSize }); // Reset to page 1 when switching tabs
  };

  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        if (status === "draft") {
          return <Tag color="orange">DRAFT</Tag>;
        }
        return <Tag color="green">COMPLETED</Tag>;
      },
    },
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
      title: "Type",
      dataIndex: "document_type",
      key: "document_type",
      width: 100,
      render: (type: string) => {
        const isBill = !type || type === 'bill';
        return (
          <Tag color={isBill ? 'cyan' : 'purple'}>
            {isBill ? 'BILL' : 'INVOICE'}
          </Tag>
        );
      },
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
      title: "Customer/Vendor",
      dataIndex: "customerDetails",
      key: "customerDetails",
      render: (customerDetails: any, record: any) => {
        // Show vendor for invoices, customer for bills
        const isInvoice = record.document_type === 'invoice';
        const partyDetails = isInvoice ? record.vendorDetails : customerDetails;
        const name = partyDetails?.vendor_name || partyDetails?.full_name || partyDetails?.name || 'N/A';
        const contact = partyDetails?.phone || partyDetails?.mobile || '';
        
        return (
          <Space>
            <UserOutlined />
            <span>
              <strong>{name}</strong>
              <br />
              <small style={{ color: "#999" }}>{contact}</small>
            </span>
          </Space>
        );
      },
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
      render: (_: any, record: any) => {
        const isDraft = record.status === "draft";
        return (
          <Space size="middle">
            <Tooltip title="View Bill">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
              />
            </Tooltip>
            {!isDraft && (
              <>
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
                <Tooltip title="Download PDF">
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(record)}
                  />
                </Tooltip>
              </>
            )}
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
        );
      },
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

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            key: "completed",
            label: (
              <span>
                ✅ Completed Bills ({activeTab === "completed" ? SalesRecordList?.result?.length || 0 : "-"})
              </span>
            ),
          },
          {
            key: "drafts",
            label: (
              <span>
                📝 Drafts ({activeTab === "drafts" ? SalesRecordList?.result?.length || 0 : "-"})
              </span>
            ),
          },
        ]}
        style={{ marginBottom: 16 }}
      />

      <GlobalTable
        data={SalesRecordList?.result || []}
        columns={columns}
        loading={loading}
        bordered
        rowKey="_id"
        totalCount={SalesRecordList?.pagination?.totalCount || SalesRecordList?.result?.length || 0}
        pageLimit={pagination.pageSize}
        onPaginationChange={handlePaginationChange}
      />

      <GlobalDrawer
        title={selectedBill ? "Edit Sale" : "Create New Sale"}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width="100%"
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