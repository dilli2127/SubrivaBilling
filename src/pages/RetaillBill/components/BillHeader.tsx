import React, { useMemo } from 'react';
import { Typography, Tooltip } from 'antd';
import AntdEditableTable, {
  AntdEditableColumn,
} from '../../../components/common/AntdEditableTable';

const { Text } = Typography;

interface BillHeaderProps {
  billFormData: {
    invoice_no: string;
    date: string;
    customer_id: string;
    customer_name?: string;
    billed_by_id?: string;
    billed_by_name?: string;
    payment_mode: string;
  };
  customerOrVendorOptions: Array<{ label: string; value: string }>;
  userOptions: Array<{ label: string; value: string }>;
  documentType: 'bill' | 'invoice';
  onHeaderChange: (headerRows: any[]) => void;
  onCustomerModalOpen: () => void;
  onUserModalOpen: () => void;
  loading: boolean;
}

const BillHeader: React.FC<BillHeaderProps> = ({
  billFormData,
  customerOrVendorOptions,
  userOptions,
  documentType,
  onHeaderChange,
  onCustomerModalOpen,
  onUserModalOpen,
  loading,
}) => {
  const headerColumns: AntdEditableColumn[] = useMemo(
    () => [
      {
        key: 'invoice_no',
        title: '📄 INVOICE #',
        dataIndex: 'invoice_no',
        type: 'text',
        required: true,
        width: 180,
      },
      {
        key: 'date',
        title: '📅 DATE',
        dataIndex: 'date',
        type: 'date',
        required: true,
        width: 150,
      },
      {
        key: 'customer_id',
        title: documentType === 'bill' ? '👤 CUSTOMER' : '🏢 VENDOR',
        dataIndex: 'customer_id',
        type: 'text',
        editable: false,
        required: true,
        width: 250,
        render: (value: any) => {
          const selectedItem = customerOrVendorOptions.find(
            (opt: any) => opt.value === value
          );
          const isVendor = documentType === 'invoice';
          const placeholderText = isVendor ? 'Select vendor' : 'Select customer';
          const displayLabel =
            selectedItem?.label || billFormData.customer_name || placeholderText;
          const tooltipText = isVendor
            ? 'Click to open vendor selection modal (or press End key)'
            : 'Click to open customer selection modal (or press End key)';

          return (
            <Tooltip title={tooltipText}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.2s ease',
                }}
                onClick={onCustomerModalOpen}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                  e.currentTarget.style.borderColor = '#1890ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#fafafa';
                  e.currentTarget.style.borderColor = '#d9d9d9';
                }}
              >
                <span>{displayLabel}</span>
                <span
                  style={{
                    fontSize: '10px',
                    color: '#1890ff',
                    backgroundColor: '#f0f8ff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #d6e4ff',
                  }}
                >
                  End
                </span>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: 'billed_by_id',
        title: '👨‍💼 BILLED BY',
        dataIndex: 'billed_by_id',
        type: 'text',
        editable: false,
        required: false,
        width: 250,
        render: (value: any) => {
          const selectedUser = userOptions.find((opt: any) => opt.value === value);
          const displayLabel = selectedUser?.label || billFormData.billed_by_name || 'Select user';
          return (
            <Tooltip title="Click to open user selection modal (or press Ctrl+U key)">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  backgroundColor: '#f0f8ff',
                  transition: 'all 0.2s ease',
                }}
                onClick={onUserModalOpen}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#e6f7ff';
                  e.currentTarget.style.borderColor = '#1890ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#f0f8ff';
                  e.currentTarget.style.borderColor = '#d9d9d9';
                }}
              >
                <span>{displayLabel}</span>
                <span
                  style={{
                    fontSize: '10px',
                    color: '#1890ff',
                    backgroundColor: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #d6e4ff',
                  }}
                >
                  Ctrl+U
                </span>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: 'payment_mode',
        title: '💳 PAYMENT',
        dataIndex: 'payment_mode',
        type: 'select',
        options: [
          { label: '💵 Cash', value: 'cash' },
          { label: '📱 UPI', value: 'upi' },
          { label: '💳 Card', value: 'card' },
        ],
        required: true,
        width: 150,
      },
    ],
    [customerOrVendorOptions, userOptions, documentType, onCustomerModalOpen, onUserModalOpen]
  );

  const headerData = useMemo(
    () => [
      {
        invoice_no: billFormData.invoice_no,
        date: billFormData.date,
        customer_id: billFormData.customer_id,
        billed_by_id: billFormData.billed_by_id,
        payment_mode: billFormData.payment_mode,
      },
    ],
    [
      billFormData.invoice_no,
      billFormData.date,
      billFormData.customer_id,
      billFormData.billed_by_id,
      billFormData.payment_mode,
    ]
  );

  return (
    <AntdEditableTable
      columns={headerColumns}
      dataSource={headerData}
      onSave={onHeaderChange}
      allowAdd={false}
      allowDelete={false}
      loading={loading}
      className="compact-header-grid"
      size="small"
      rowKey="invoice_no"
    />
  );
};

export default BillHeader;

