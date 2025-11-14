import React, { useState, useMemo } from 'react';
import { Modal, Input, Table, Button, Space, Tag, message, Tooltip } from 'antd';
import { SearchOutlined, FileTextOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { apiSlice } from '../../services/redux/api/apiSlice';
import dayjs from 'dayjs';

interface SelectInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (invoice: any) => void;
}

const SelectInvoiceModal: React.FC<SelectInvoiceModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  // Get all sales records (completed sales only)
  const { data: salesData, isLoading } = apiSlice.useGetSalesRecordQuery({
    page: 1,
    limit: 100,
    // TODO: Add filter for completed sales only
  });
  
  const invoices = useMemo(() => (salesData as any)?.result || [], [salesData]);
  
  // Filter invoices by search text
  const filteredInvoices = useMemo(() => {
    if (!searchText) return invoices;
    
    const search = searchText.toLowerCase();
    return invoices.filter((invoice: any) => {
      const invoiceNo = invoice.invoice_no || invoice.invoice_number || '';
      const customerName = invoice.customerDetails?.full_name || invoice.customer_name || '';
      const customerPhone = invoice.customerDetails?.mobile || invoice.customer_phone || '';
      
      return invoiceNo.toLowerCase().includes(search) ||
             customerName.toLowerCase().includes(search) ||
             customerPhone.includes(search);
    });
  }, [invoices, searchText]);
  
  const handleSelect = () => {
    if (!selectedInvoice) {
      message.warning('Please select an invoice');
      return;
    }
    onSelect(selectedInvoice);
  };
  
  const columns = [
    {
      title: 'Invoice Number',
      key: 'invoice_number',
      width: 140,
      render: (record: any) => (
        <Tag color="blue" icon={<FileTextOutlined />}>
          {record.invoice_no || record.invoice_number || '-'}
        </Tag>
      ),
    },
    {
      title: 'Date',
      key: 'invoice_date',
      width: 120,
      render: (record: any) => {
        const date = record.date || record.invoice_date;
        return date ? (
          <span>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {dayjs(date).format('DD/MM/YYYY')}
          </span>
        ) : '-';
      },
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (record: any) => {
        const customerName = record.customerDetails?.full_name || record.customer_name || '-';
        const customerPhone = record.customerDetails?.mobile || record.customer_phone;
        
        return (
          <div>
            <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <strong>{customerName}</strong>
            {customerPhone && (
              <div style={{ fontSize: '11px', color: '#888' }}>
                {customerPhone}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 120,
      render: (amount: any) => (
        <strong style={{ color: '#52c41a' }}>
          ₹{Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </strong>
      ),
    },
    {
      title: 'Items',
      key: 'items',
      width: 80,
      align: 'center' as const,
      render: (record: any) => {
        const itemsCount = record.Items?.length || record.sales_record_items?.length || record.items?.length || 0;
        return <Tag color="geekblue">{itemsCount}</Tag>;
      },
    },
    {
      title: 'Payment',
      dataIndex: 'is_paid',
      key: 'payment_status',
      width: 100,
      render: (status: boolean) => {
        const isPaid = status === true;
        return (
          <Tag color={isPaid ? 'green' : 'orange'}>
            {isPaid ? 'Paid' : 'Pending'}
          </Tag>
        );
      },
    },
  ];
  
  return (
    <Modal
      title={
        <Space>
          <SearchOutlined style={{ color: '#1890ff' }} />
          <span>Select Original Invoice</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="select"
          type="primary"
          onClick={handleSelect}
          disabled={!selectedInvoice}
        >
          Select Invoice
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search by invoice number, customer name, or phone..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredInvoices}
        loading={isLoading}
        rowKey="_id"
        size="small"
        scroll={{ y: 400 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} invoices`,
        }}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedInvoice ? [selectedInvoice._id] : [],
          onChange: (selectedRowKeys, selectedRows) => {
            setSelectedInvoice(selectedRows[0]);
          },
        }}
      />
    </Modal>
  );
};

export default SelectInvoiceModal;

