import React from 'react';
import { Tag, Tooltip, Button, Space, Badge, Popconfirm, Dropdown, Menu } from 'antd';
import dayjs from 'dayjs';
import {
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  CheckOutlined,
  StopOutlined,
  InboxOutlined,
  WarningOutlined,
  MoreOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { POStatus } from '../../types/purchaseOrder';
import { canRead, canUpdate, canDelete, RESOURCES } from '../../helpers/permissionHelper';

// Status Configuration
const statusConfig: Record<POStatus, { color: string; icon: React.ReactNode; label: string }> = {
  draft: { color: 'default', icon: <EditOutlined />, label: 'Draft' },
  pending_approval: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Pending Approval' },
  approved: { color: 'success', icon: <CheckCircleOutlined />, label: 'Approved' },
  rejected: { color: 'error', icon: <CloseCircleOutlined />, label: 'Rejected' },
  sent: { color: 'processing', icon: <SendOutlined />, label: 'Sent' },
  confirmed: { color: 'cyan', icon: <CheckCircleOutlined />, label: 'Confirmed' },
  partially_received: { color: 'purple', icon: <InboxOutlined />, label: 'Partially Received' },
  fully_received: { color: 'green', icon: <CheckCircleOutlined />, label: 'Fully Received' },
  cancelled: { color: 'red', icon: <StopOutlined />, label: 'Cancelled' },
  closed: { color: 'default', icon: <CheckCircleOutlined />, label: 'Closed' },
};

interface ColumnActions {
  onView: (record: any) => void;
  onEdit: (record: any) => void;
  onDelete: (record: any) => void;
  onSubmit: (record: any) => void;
  onApprove: (record: any) => void;
  onReject: (record: any) => void;
  onSend: (record: any) => void;
  onReceive: (record: any) => void;
  onCancel: (record: any) => void;
  onPrint: (record: any) => void;
}

export const purchaseOrderColumns = (actions: ColumnActions) => [
  {
    title: 'PO Number',
    dataIndex: 'po_number',
    key: 'po_number',
    fixed: 'left' as const,
    width: 140,
    render: (text: string, record: any) => (
      <div>
        <Tag icon={<FileTextOutlined />} color="blue" style={{ fontSize: '12px' }}>
          {text}
        </Tag>
        {record.is_urgent && (
          <Tag color="red" style={{ marginTop: 4 }}>
            URGENT
          </Tag>
        )}
      </div>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 160,
    filters: Object.keys(statusConfig).map(key => ({
      text: statusConfig[key as POStatus].label,
      value: key,
    })),
    onFilter: (value: any, record: any) => record.status === value,
    render: (status: POStatus, record: any) => {
      const config = statusConfig[status] || statusConfig.draft;
      const isOverdue = record.expected_delivery_date && 
        dayjs(record.expected_delivery_date).isBefore(dayjs()) &&
        !['fully_received', 'cancelled', 'closed'].includes(status);
      
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
          {isOverdue && (
            <Tag color="red" icon={<WarningOutlined />} style={{ marginTop: 4 }}>
              OVERDUE
            </Tag>
          )}
        </div>
      );
    },
  },
  {
    title: 'Vendor',
    dataIndex: 'VendorItem',
    key: 'vendor',
    width: 180,
    render: (vendor: any, record: any) => {
      const vendorData = vendor || { vendor_name: record.vendor_name, company_name: '' };
      return (
        <Tooltip title={vendorData.company_name || 'No company name'}>
          <div>
            <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <strong>{vendorData.vendor_name || '-'}</strong>
            {vendorData.company_name && (
              <div style={{ fontSize: '11px', color: '#888' }}>
                {vendorData.company_name}
              </div>
            )}
          </div>
        </Tooltip>
      );
    },
  },
  {
    title: 'PO Date',
    dataIndex: 'po_date',
    key: 'po_date',
    width: 120,
    sorter: (a: any, b: any) => dayjs(a.po_date).unix() - dayjs(b.po_date).unix(),
    render: (date: string) => (
      <span>
        <CalendarOutlined style={{ marginRight: 4 }} />
        {dayjs(date).format('DD/MM/YYYY')}
      </span>
    ),
  },
  {
    title: 'Expected Delivery',
    dataIndex: 'expected_delivery_date',
    key: 'expected_delivery_date',
    width: 140,
    sorter: (a: any, b: any) => 
      dayjs(a.expected_delivery_date || 0).unix() - dayjs(b.expected_delivery_date || 0).unix(),
    render: (date: string, record: any) => {
      if (!date) return <span style={{ color: '#999' }}>-</span>;
      
      const isOverdue = dayjs(date).isBefore(dayjs()) &&
        !['fully_received', 'cancelled', 'closed'].includes(record.status);
      const daysLeft = dayjs(date).diff(dayjs(), 'days');
      
      return (
        <Tooltip title={isOverdue ? 'Overdue!' : `${daysLeft} days left`}>
          <span style={{ color: isOverdue ? '#ff4d4f' : daysLeft <= 3 ? '#faad14' : 'inherit' }}>
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
    sorter: (a: any, b: any) => (a.total_amount || 0) - (b.total_amount || 0),
    render: (amount: number) => (
      <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
        <DollarOutlined style={{ marginRight: 4 }} />
        ₹{amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    title: 'Paid Amount',
    dataIndex: 'paid_amount',
    key: 'paid_amount',
    width: 130,
    render: (paid: number, record: any) => {
      const total = record.total_amount || 0;
      const percentage = total > 0 ? ((paid || 0) / total) * 100 : 0;
      
      return (
        <Tooltip title={`${percentage.toFixed(0)}% paid`}>
          <div>
            <span style={{ color: percentage === 100 ? '#52c41a' : '#faad14' }}>
              ₹{(paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            {percentage > 0 && percentage < 100 && (
              <div style={{ fontSize: '11px', color: '#888' }}>
                ({percentage.toFixed(0)}%)
              </div>
            )}
          </div>
        </Tooltip>
      );
    },
  },
  {
    title: 'Outstanding',
    dataIndex: 'outstanding_amount',
    key: 'outstanding_amount',
    width: 130,
    render: (outstanding: number) => (
      <span style={{ color: outstanding > 0 ? '#ff4d4f' : '#52c41a' }}>
        ₹{(outstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    title: 'Receipt Status',
    key: 'receipt_status',
    width: 140,
    render: (record: any) => {
      const totalItems = record.items?.length || 0;
      const receivedItems = record.items?.filter((item: any) => 
        item.received_quantity >= item.quantity
      ).length || 0;
      
      if (receivedItems === 0) {
        return <Tag color="default">Not Received</Tag>;
      } else if (receivedItems === totalItems) {
        return <Tag color="green" icon={<CheckCircleOutlined />}>Complete</Tag>;
      } else {
        return (
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            {receivedItems}/{totalItems}
          </Tag>
        );
      }
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
    render: (record: any) => {
      // Permission checks
      const hasReadPerm = canRead(RESOURCES.PURCHASE_ORDER);
      const hasUpdatePerm = canUpdate(RESOURCES.PURCHASE_ORDER);
      const hasDeletePerm = canDelete(RESOURCES.PURCHASE_ORDER);
      
      // Status-based checks
      const canEditByStatus = ['draft', 'rejected'].includes(record.status);
      const isDraft = record.status === 'draft';
      
      // Combined permission + status checks
      const canEdit = hasUpdatePerm && canEditByStatus;
      const canDeleteRecord = hasDeletePerm && isDraft;
      
      // P/O Actions dropdown menu - Show actions based on permissions
      const poActionsMenu = (
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
          
          {/* Submit - requires update permission */}
          {hasUpdatePerm && (
            <Menu.Item 
              key="submit" 
              icon={<UploadOutlined />}
              onClick={() => actions.onSubmit(record)}
              style={{ color: '#1890ff' }}
              disabled={record.status !== 'draft'}
            >
              Submit for Approval
            </Menu.Item>
          )}
          
          {/* Approve - requires update permission */}
          {hasUpdatePerm && (
            <Menu.Item 
              key="approve" 
              icon={<CheckOutlined />}
              onClick={() => actions.onApprove(record)}
              style={{ color: '#52c41a' }}
              disabled={record.status !== 'pending_approval'}
            >
              Approve PO
            </Menu.Item>
          )}
          
          {/* Reject - requires update permission */}
          {hasUpdatePerm && (
            <Menu.Item 
              key="reject" 
              icon={<CloseCircleOutlined />}
              onClick={() => actions.onReject(record)}
              danger
              disabled={!['pending_approval', 'approved'].includes(record.status)}
            >
              Reject PO
            </Menu.Item>
          )}
          
          {/* Send - requires update permission */}
          {hasUpdatePerm && (
            <Menu.Item 
              key="send" 
              icon={<SendOutlined />}
              onClick={() => actions.onSend(record)}
              disabled={record.status !== 'approved'}
            >
              Send to Vendor
            </Menu.Item>
          )}
          
          {/* Receive - requires update permission */}
          {hasUpdatePerm && (
            <Menu.Item 
              key="receive" 
              icon={<InboxOutlined />}
              onClick={() => actions.onReceive(record)}
              style={{ color: '#1890ff' }}
              disabled={!['sent', 'confirmed', 'partially_received'].includes(record.status)}
            >
              Receive Goods
            </Menu.Item>
          )}
          
          {/* Print - requires read permission */}
          {hasReadPerm && (
            <Menu.Item 
              key="print" 
              icon={<DownloadOutlined />}
              onClick={() => actions.onPrint(record)}
            >
              Print / Download
            </Menu.Item>
          )}
          
          {/* Cancel - requires update permission */}
          {hasUpdatePerm && (
            <>
              <Menu.Divider />
              <Menu.Item 
                key="cancel" 
                icon={<StopOutlined />}
                onClick={() => {
                  // Show confirmation
                  const confirmed = window.confirm('Cancel this Purchase Order?');
                  if (confirmed) actions.onCancel(record);
                }}
                danger
                disabled={['cancelled', 'closed', 'fully_received'].includes(record.status)}
              >
                Cancel PO
              </Menu.Item>
            </>
          )}
        </Menu>
      );
      
      // Don't show actions column if user has no permissions at all
      if (!hasReadPerm && !hasUpdatePerm && !hasDeletePerm) {
        return null;
      }
      
      return (
        <Space size="small">
          {/* Default Actions - Based on permissions */}
          
          {/* Edit - requires update permission */}
          {hasUpdatePerm && (
            <Tooltip title={canEdit ? "Edit" : hasUpdatePerm ? "Edit (not available for this status)" : "No update permission"}>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => actions.onEdit(record)}
                disabled={!canEdit}
              />
            </Tooltip>
          )}
          
          {/* Delete - requires delete permission */}
          {hasDeletePerm && (
            <Popconfirm
              title="Delete this Purchase Order?"
              description="This action cannot be undone."
              onConfirm={() => actions.onDelete(record)}
              okText="Yes"
              cancelText="No"
              disabled={!canDeleteRecord}
            >
              <Tooltip title={canDeleteRecord ? "Delete" : hasDeletePerm ? "Delete (only Draft can be deleted)" : "No delete permission"}>
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!canDeleteRecord}
                />
              </Tooltip>
            </Popconfirm>
          )}
          
          {/* P/O Actions Dropdown - only show if user has read or update permission */}
          {(hasReadPerm || hasUpdatePerm) && (
            <Dropdown overlay={poActionsMenu} trigger={['click']} placement="bottomRight">
              <Tooltip title="P/O Actions">
                <Button
                  type="primary"
                  size="small"
                  icon={<MoreOutlined />}
                />
              </Tooltip>
            </Dropdown>
          )}
        </Space>
      );
    },
  },
];

