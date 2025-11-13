import React from 'react';
import { Tag, Tooltip, Button, Space, Badge, Dropdown, Menu } from 'antd';
import dayjs from 'dayjs';
import {
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  StopOutlined,
  WarningOutlined,
  MoreOutlined,
  UploadOutlined,
  UndoOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { ReturnStatus } from '../../types/salesReturn';
import { canRead, canUpdate, canDelete, RESOURCES } from '../../helpers/permissionHelper';

// Status Configuration
const statusConfig: Record<ReturnStatus, { color: string; icon: React.ReactNode; label: string }> = {
  draft: { color: 'default', icon: <EditOutlined />, label: 'Draft' },
  pending_approval: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Pending Approval' },
  approved: { color: 'success', icon: <CheckCircleOutlined />, label: 'Approved' },
  rejected: { color: 'error', icon: <CloseCircleOutlined />, label: 'Rejected' },
  completed: { color: 'green', icon: <CheckCircleOutlined />, label: 'Completed' },
  cancelled: { color: 'red', icon: <StopOutlined />, label: 'Cancelled' },
};

// Refund Type Configuration
const refundTypeConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  cash: { color: 'green', icon: <DollarOutlined />, label: 'Cash' },
  card: { color: 'blue', icon: <CreditCardOutlined />, label: 'Card' },
  upi: { color: 'purple', icon: <CreditCardOutlined />, label: 'UPI' },
  points: { color: 'orange', icon: <CreditCardOutlined />, label: 'Customer Points' },
  bank_transfer: { color: 'cyan', icon: <CreditCardOutlined />, label: 'Bank Transfer' },
};

interface ColumnActions {
  onView: (record: any) => void;
  onEdit: (record: any) => void;
  onDelete: (record: any) => void;
  onSubmit: (record: any) => void;
  onApprove: (record: any) => void;
  onReject: (record: any) => void;
  onComplete: (record: any) => void;
  onCancel: (record: any) => void;
  onPrint: (record: any) => void;
}

export const salesReturnColumns = (actions: ColumnActions) => [
  {
    title: 'Return Number',
    dataIndex: 'return_number',
    key: 'return_number',
    fixed: 'left' as const,
    width: 140,
    render: (text: string) => (
      <Tag icon={<UndoOutlined />} color="orange" style={{ fontSize: '12px' }}>
        {text}
      </Tag>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 160,
    filters: Object.keys(statusConfig).map(key => ({
      text: statusConfig[key as ReturnStatus].label,
      value: key,
    })),
    onFilter: (value: any, record: any) => record.status === value,
    render: (status: ReturnStatus) => {
      const config = statusConfig[status] || statusConfig.draft;
      return (
        <Badge 
          status={config.color as any} 
          text={
            <Tag color={config.color} icon={config.icon}>
              {config.label}
            </Tag>
          }
        />
      );
    },
  },
  {
    title: 'Return Date',
    dataIndex: 'return_date',
    key: 'return_date',
    width: 120,
    sorter: (a: any, b: any) => dayjs(a.return_date).unix() - dayjs(b.return_date).unix(),
    render: (date: string) => (
      <span>
        <CalendarOutlined style={{ marginRight: 4 }} />
        {dayjs(date).format('DD/MM/YYYY')}
      </span>
    ),
  },
  {
    title: 'Original Invoice',
    dataIndex: 'invoice_number',
    key: 'invoice_number',
    width: 140,
    render: (invoiceNo: string, record: any) => (
      <Tooltip title={`Invoice Date: ${record.invoice_date ? dayjs(record.invoice_date).format('DD/MM/YYYY') : '-'}`}>
        <Tag color="blue" icon={<FileTextOutlined />}>
          {invoiceNo || '-'}
        </Tag>
      </Tooltip>
    ),
  },
  {
    title: 'Customer',
    dataIndex: 'CustomerItem',
    key: 'customer',
    width: 180,
    render: (customer: any, record: any) => {
      const customerData = customer || { customer_name: record.customer_name };
      return (
        <Tooltip title={customerData.email || customerData.phone}>
          <div>
            <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <strong>{customerData.customer_name || record.customer_name || '-'}</strong>
            {customerData.phone && (
              <div style={{ fontSize: '11px', color: '#888' }}>
                {customerData.phone}
              </div>
            )}
          </div>
        </Tooltip>
      );
    },
  },
  {
    title: 'Items Returned',
    dataIndex: 'items',
    key: 'items_count',
    width: 100,
    align: 'center' as const,
    render: (items: any[]) => (
      <Tag color="orange">{items?.length || 0} items</Tag>
    ),
  },
  {
    title: 'Refund Type',
    dataIndex: 'refund_type',
    key: 'refund_type',
    width: 130,
    filters: Object.keys(refundTypeConfig).map(key => ({
      text: refundTypeConfig[key].label,
      value: key,
    })),
    onFilter: (value: any, record: any) => record.refund_type === value,
    render: (type: string) => {
      const config = refundTypeConfig[type] || refundTypeConfig.cash;
      return (
        <Tag color={config.color} icon={config.icon}>
          {config.label}
        </Tag>
      );
    },
  },
    {
      title: 'Refund Amount',
      dataIndex: 'refund_amount',
      key: 'refund_amount',
      width: 130,
      sorter: (a: any, b: any) => (Number(a.refund_amount) || 0) - (Number(b.refund_amount) || 0),
      render: (amount: any, record: any) => (
        <div>
          <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
            <DollarOutlined style={{ marginRight: 4 }} />
            ₹{Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <div style={{ fontSize: '11px', color: '#888' }}>
            {record.refund_status === 'completed' ? (
              <Tag color="green" style={{ marginTop: 2 }}>Paid</Tag>
            ) : (
              <Tag color="orange" style={{ marginTop: 2 }}>Pending</Tag>
            )}
          </div>
        </div>
      ),
    },
  {
    title: 'Points Issued',
    key: 'points_issued',
    width: 130,
    render: (record: any) => {
      if (record.refund_type !== 'points') {
        return <span style={{ color: '#999' }}>-</span>;
      }
      
      const pointsIssued = Math.floor(Number(record.refund_amount || 0));
      
      return (
        <Tooltip title="Points added to customer balance">
          <Tag color="orange" icon={<CreditCardOutlined />}>
            {pointsIssued} pts (₹{pointsIssued})
          </Tag>
        </Tooltip>
      );
    },
  },
  {
    title: 'Stock Returned',
    key: 'stock_returned',
    width: 120,
    align: 'center' as const,
    render: (record: any) => (
      record.stock_returned ? (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Restocked
        </Tag>
      ) : (
        <Tag color="default">Not Restocked</Tag>
      )
    ),
  },
  {
    title: 'Created By',
    dataIndex: 'created_by_name',
    key: 'created_by',
    width: 120,
    render: (name: string) => (
      <span style={{ fontSize: '12px' }}>{name || '-'}</span>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    fixed: 'right' as const,
    width: 120,
    render: (record: any) => {
      // Permission checks
      const hasReadPerm = canRead(RESOURCES.SALES_RETURN);
      const hasUpdatePerm = canUpdate(RESOURCES.SALES_RETURN);
      const hasDeletePerm = canDelete(RESOURCES.SALES_RETURN);
      
      // Status-based checks
      const canEditByStatus = record.status === 'draft';
      const isDraft = record.status === 'draft';
      
      // Combined checks
      const canEdit = hasUpdatePerm && canEditByStatus;
      const canDeleteRecord = hasDeletePerm && isDraft;
      
      // Return Actions dropdown menu
      const returnActionsMenu = (
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
              Approve Return
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
              Reject Return
            </Menu.Item>
          )}
          
          {/* Complete - requires update permission */}
          {hasUpdatePerm && (
            <Menu.Item 
              key="complete" 
              icon={<CheckCircleOutlined />}
              onClick={() => actions.onComplete(record)}
              style={{ color: '#52c41a' }}
              disabled={record.status !== 'approved'}
            >
              Mark Completed
            </Menu.Item>
          )}
          
          {/* Print - requires read permission */}
          {hasReadPerm && (
            <Menu.Item 
              key="print" 
              icon={<FileTextOutlined />}
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
                  const confirmed = window.confirm('Cancel this Return?');
                  if (confirmed) actions.onCancel(record);
                }}
                danger
                disabled={['completed', 'cancelled'].includes(record.status)}
              >
                Cancel Return
              </Menu.Item>
            </>
          )}
        </Menu>
      );
      
      // Don't show actions if no permissions
      if (!hasReadPerm && !hasUpdatePerm && !hasDeletePerm) {
        return null;
      }
      
      return (
        <Space size="small">
          {/* Edit - requires update permission */}
          {hasUpdatePerm && (
            <Tooltip title={canEdit ? "Edit" : "Edit (not available for this status)"}>
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
            <Tooltip title={canDeleteRecord ? "Delete" : "Delete (only Draft can be deleted)"}>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => actions.onDelete(record)}
                disabled={!canDeleteRecord}
              />
            </Tooltip>
          )}
          
          {/* Return Actions Dropdown */}
          {(hasReadPerm || hasUpdatePerm) && (
            <Dropdown overlay={returnActionsMenu} trigger={['click']} placement="bottomRight">
              <Tooltip title="Return Actions">
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

