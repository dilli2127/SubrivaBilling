import React from 'react';
import { Tag, Tooltip, Button, Space, Badge, Dropdown, Menu } from 'antd';
import dayjs from 'dayjs';
import {
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  WarningOutlined,
  MoreOutlined,
  FileSyncOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { QuotationStatus, Quotation } from '../../types/quotation';
import { canRead, canUpdate, canDelete, RESOURCES } from '../../helpers/permissionHelper';

// Status Configuration
const statusConfig: Record<QuotationStatus, { color: string; icon: React.ReactNode; label: string }> = {
  draft: { color: 'default', icon: <EditOutlined />, label: 'Draft' },
  sent: { color: 'processing', icon: <SendOutlined />, label: 'Sent' },
  accepted: { color: 'success', icon: <CheckCircleOutlined />, label: 'Accepted' },
  rejected: { color: 'error', icon: <CloseCircleOutlined />, label: 'Rejected' },
  expired: { color: 'warning', icon: <WarningOutlined />, label: 'Expired' },
  converted: { color: 'green', icon: <FileSyncOutlined />, label: 'Converted' },
};

interface ColumnActions {
  onView: (record: Quotation) => void;
  onEdit: (record: Quotation) => void;
  onDelete: (record: Quotation) => void;
  onSend: (record: Quotation) => void;
  onConvert: (record: Quotation) => void;
  onAccept: (record: Quotation) => void;
  onReject: (record: Quotation) => void;
  onPrint: (record: Quotation) => void;
}

export const quotationColumns = (actions: ColumnActions) => [
  {
    title: 'Quotation #',
    dataIndex: 'quotation_number',
    key: 'quotation_number',
    fixed: 'left' as const,
    width: 140,
    render: (text: string, record: Quotation) => (
      <div>
        <Tag icon={<FileTextOutlined />} color="blue" style={{ fontSize: '12px' }}>
          {text}
        </Tag>
        {record.status === 'converted' && (
          <Tag color="green" style={{ marginTop: 4 }}>
            CONVERTED
          </Tag>
        )}
      </div>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 140,
    filters: Object.keys(statusConfig).map(key => ({
      text: statusConfig[key as QuotationStatus].label,
      value: key,
    })),
    onFilter: (value: string | number | boolean, record: Quotation) => record.status === value,
    render: (status: QuotationStatus, record: Quotation) => {
      const config = statusConfig[status] || statusConfig.draft;
      const isExpired = record.valid_until && 
        dayjs(record.valid_until).isBefore(dayjs()) &&
        !['converted', 'rejected'].includes(status);
      
      return (
        <div>
          <Badge 
            status={config.color as any} 
            text={
              <Tag color={config.color} icon={config.icon}>
                {config.label}
              </Tag>
            }
          />
          {isExpired && status !== 'expired' && (
            <Tag color="red" icon={<WarningOutlined />} style={{ marginTop: 4 }}>
              EXPIRED
            </Tag>
          )}
        </div>
      );
    },
  },
  {
    title: 'Customer',
    dataIndex: 'customer',
    key: 'customer',
    width: 180,
    render: (customer: any, record: Quotation) => {
      // Check multiple possible customer field names
      const recordAny = record as any; // API may return additional fields
      const customerData = customer || record.CustomerItem || { 
        customer_name: record.customer_name, 
        full_name: recordAny.full_name,
        name: recordAny.name,
        company_name: '' 
      };
      
      const customerName = customerData.customer_name || customerData.full_name || customerData.name || '-';
      
      return (
        <Tooltip title={customerData.company_name || customerData.email || 'No additional info'}>
          <div>
            <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <strong>{customerName}</strong>
            {customerData.company_name && (
              <div style={{ fontSize: '11px', color: '#888' }}>
                {customerData.company_name}
              </div>
            )}
          </div>
        </Tooltip>
      );
    },
  },
  {
    title: 'Quotation Date',
    dataIndex: 'quotation_date',
    key: 'quotation_date',
    width: 120,
    sorter: (a: Quotation, b: Quotation) => dayjs(a.quotation_date).unix() - dayjs(b.quotation_date).unix(),
    render: (date: string) => {
      if (!date) return <span style={{ color: '#999' }}>-</span>;
      return (
        <span>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      );
    },
  },
  {
    title: 'Valid Until',
    dataIndex: 'valid_until',
    key: 'valid_until',
    width: 140,
    sorter: (a: Quotation, b: Quotation) => 
      dayjs(a.valid_until || 0).unix() - dayjs(b.valid_until || 0).unix(),
    render: (date: string, record: Quotation) => {
      if (!date) return <span style={{ color: '#999' }}>-</span>;
      
      const isExpired = dayjs(date).isBefore(dayjs()) &&
        !['converted', 'rejected'].includes(record.status);
      const daysLeft = dayjs(date).diff(dayjs(), 'days');
      
      return (
        <Tooltip title={isExpired ? 'Expired!' : `${daysLeft} days left`}>
          <span style={{ color: isExpired ? '#ff4d4f' : daysLeft <= 3 ? '#faad14' : 'inherit' }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {dayjs(date).format('DD/MM/YYYY')}
          </span>
        </Tooltip>
      );
    },
  },
  {
    title: 'Items',
    dataIndex: 'items',
    key: 'items_count',
    width: 80,
    align: 'center' as const,
    render: (items: any[]) => (
      <Tag color="geekblue">{items?.length || 0} items</Tag>
    ),
  },
  {
    title: 'Total Amount',
    dataIndex: 'total_amount',
    key: 'total_amount',
    width: 130,
    sorter: (a: Quotation, b: Quotation) => (a.total_amount || 0) - (b.total_amount || 0),
    render: (amount: number) => (
      <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
        <DollarOutlined style={{ marginRight: 4 }} />
        ₹{amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    title: 'Converted To',
    dataIndex: 'converted_to_invoice_no',
    key: 'converted_to',
    width: 150,
    render: (salesRecordId: string, record: Quotation) => {
      if (!salesRecordId) return <span style={{ color: '#999' }}>-</span>;
      
      const tooltipTitle = record.converted_date 
        ? `Converted on ${dayjs(record.converted_date).format('DD/MM/YYYY')}`
        : 'Converted to Invoice';
      
      return (
        <Tooltip title={tooltipTitle}>
          <Tag color="green" icon={<FileSyncOutlined />}>
            {salesRecordId}
          </Tag>
        </Tooltip>
      );
    },
  },
  {
    title: 'Created By',
    dataIndex: 'CreatedByUser',
    key: 'created_by',
    width: 130,
    render: (user: any) => (
      <Tooltip title={user?.email}>
        <span style={{ fontSize: '12px' }}>
          {user?.username || '-'}
        </span>
      </Tooltip>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    fixed: 'right' as const,
    width: 120,
    render: (_: unknown, record: Quotation) => {
      // Permission checks
      const hasReadPerm = canRead(RESOURCES.QUOTATION);
      const hasUpdatePerm = canUpdate(RESOURCES.QUOTATION);
      const hasDeletePerm = canDelete(RESOURCES.QUOTATION);
      
      // Status-based checks
      const canEditByStatus = ['draft', 'rejected'].includes(record.status);
      const isDraft = record.status === 'draft';
      const canConvert = ['draft', 'sent', 'accepted'].includes(record.status);
      const canSend = record.status === 'draft';
      
      // Combined permission + status checks
      const canEdit = hasUpdatePerm && canEditByStatus;
      const canDeleteRecord = hasDeletePerm && isDraft;
      
      // Quotation Actions dropdown menu
      const quotationActionsMenu = (
        <Menu>
          {/* View - requires read permission */}
          {hasReadPerm && (
            <Menu.Item 
              key="view" 
              icon={<EyeOutlined />}
              onClick={() => actions.onView(record)}
            >
              View Details
            </Menu.Item>
          )}
          
          {/* Send - requires update permission */}
          {hasUpdatePerm && canSend && (
            <Menu.Item 
              key="send" 
              icon={<MailOutlined />}
              onClick={() => actions.onSend(record)}
            >
              Send to Customer
            </Menu.Item>
          )}
          
          {/* Convert to Invoice - requires update permission */}
          {hasUpdatePerm && canConvert && (
            <Menu.Item 
              key="convert" 
              icon={<FileSyncOutlined />}
              onClick={() => actions.onConvert(record)}
            >
              Convert to Invoice
            </Menu.Item>
          )}
          
          {/* Accept - requires update permission */}
          {hasUpdatePerm && record.status === 'sent' && (
            <Menu.Item 
              key="accept" 
              icon={<CheckCircleOutlined />}
              onClick={() => actions.onAccept(record)}
            >
              Mark as Accepted
            </Menu.Item>
          )}
          
          {/* Reject - requires update permission */}
          {hasUpdatePerm && record.status === 'sent' && (
            <Menu.Item 
              key="reject" 
              icon={<CloseCircleOutlined />}
              onClick={() => actions.onReject(record)}
            >
              Mark as Rejected
            </Menu.Item>
          )}
          
          {/* Print - requires read permission */}
          {hasReadPerm && (
            <Menu.Item 
              key="print" 
              icon={<DownloadOutlined />}
              onClick={() => actions.onPrint(record)}
            >
              Print/PDF
            </Menu.Item>
          )}
          
          {/* Edit - requires update permission */}
          {canEdit && (
            <Menu.Item 
              key="edit" 
              icon={<EditOutlined />}
              onClick={() => actions.onEdit(record)}
            >
              Edit
            </Menu.Item>
          )}
          
          {/* Delete - requires delete permission */}
          {canDeleteRecord && (
            <>
              <Menu.Divider />
              <Menu.Item 
                key="delete" 
                icon={<DeleteOutlined />}
                danger
                onClick={() => actions.onDelete(record)}
              >
                Delete
              </Menu.Item>
            </>
          )}
        </Menu>
      );
      
      return (
        <Space>
          {/* Quick Actions - Show most common actions as buttons */}
          {hasReadPerm && (
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => actions.onView(record)}
              />
            </Tooltip>
          )}
          
          {hasUpdatePerm && canConvert && (
            <Tooltip title="Convert to Invoice">
              <Button
                type="text"
                size="small"
                icon={<FileSyncOutlined />}
                onClick={() => actions.onConvert(record)}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
          
          {/* More Actions Dropdown */}
          <Dropdown overlay={quotationActionsMenu} trigger={['click']}>
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </Space>
      );
    },
  },
];

