import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Progress, Alert } from 'antd';
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  InboxOutlined,
  WarningOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import {
  useGetPODashboardStatsQuery,
  useGetPurchaseOrdersQuery,
  useGetPendingApprovalsQuery,
  useGetOverduePOsQuery,
} from '../../services/redux/api/endpoints';
import dayjs from 'dayjs';

const PODashboard: React.FC = () => {
  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useGetPODashboardStatsQuery(undefined);
  const { data: pendingApprovalsData } = useGetPendingApprovalsQuery(undefined);
  const { data: overduePOsData } = useGetOverduePOsQuery(undefined);
  const { data: recentPOsData } = useGetPurchaseOrdersQuery({
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const pendingApprovals = (pendingApprovalsData as any)?.result || [];
  const overduePOs = (overduePOsData as any)?.result || [];
  const recentPOs = (recentPOsData as any)?.result || [];

  // Quick stats columns
  const quickStatsColumns = [
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => (
        <Tag color={getStatusColor(record.status)}>{record.status?.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'PO Number',
      dataIndex: 'po_number',
      key: 'po_number',
    },
    {
      title: 'Vendor',
      key: 'vendor',
      render: (_: any, record: any) => record.VendorItem?.vendor_name,
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `₹${amount?.toLocaleString('en-IN')}`,
    },
    {
      title: 'Date',
      dataIndex: 'po_date',
      key: 'po_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'default',
      pending_approval: 'warning',
      approved: 'success',
      sent: 'processing',
      partially_received: 'purple',
      fully_received: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  return (
    <div style={{ padding: '24px' }}>
      <Alert
        message="Purchase Order Dashboard"
        description="Monitor and track all purchase orders, approvals, and receipts in one place."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Total Purchase Orders"
              value={(stats as any)?.total_pos || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Pending Approval"
              value={(stats as any)?.pending_approval_pos || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Awaiting Receipt"
              value={(stats as any)?.pending_receipts || 0}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Overdue POs"
              value={(stats as any)?.overdue_pos || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Financial Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <DollarOutlined style={{ marginRight: 8 }} />
                Total PO Value
              </span>
            }
            loading={statsLoading}
          >
            <Statistic
              value={(stats as any)?.total_po_value || 0}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#52c41a', fontSize: '32px' }}
            />
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8 }}>Outstanding Amount</div>
              <Progress
                percent={
                  (stats as any)?.total_po_value > 0
                    ? (((stats as any)?.outstanding_po_value || 0) / (stats as any).total_po_value) * 100
                    : 0
                }
                format={(percent) => `₹${(stats as any)?.outstanding_po_value?.toLocaleString('en-IN') || 0}`}
                strokeColor="#ff4d4f"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="PO Status Distribution"
            loading={statsLoading}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Draft"
                  value={(stats as any)?.draft_pos || 0}
                  valueStyle={{ fontSize: '20px' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Approved"
                  value={(stats as any)?.approved_pos || 0}
                  valueStyle={{ fontSize: '20px', color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Sent"
                  value={(stats as any)?.sent_pos || 0}
                  valueStyle={{ fontSize: '20px', color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card
          title={
            <span>
              <ClockCircleOutlined style={{ marginRight: 8, color: '#faad14' }} />
              Pending Approvals ({pendingApprovals.length})
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <Table
            columns={quickStatsColumns}
            dataSource={pendingApprovals}
            rowKey="_id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Overdue Purchase Orders */}
      {overduePOs.length > 0 && (
        <Card
          title={
            <span>
              <WarningOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
              Overdue Purchase Orders ({overduePOs.length})
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <Table
            columns={[
              ...quickStatsColumns,
              {
                title: 'Expected Delivery',
                dataIndex: 'expected_delivery_date',
                key: 'expected_delivery_date',
                render: (date: string) => (
                  <Tag color="red">
                    {dayjs(date).format('DD/MM/YYYY')} ({dayjs().diff(dayjs(date), 'days')} days overdue)
                  </Tag>
                ),
              },
            ]}
            dataSource={overduePOs}
            rowKey="_id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Recent Purchase Orders */}
      <Card
        title={
          <span>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Recent Purchase Orders
          </span>
        }
      >
        <Table
          columns={quickStatsColumns}
          dataSource={recentPOs}
          rowKey="_id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default PODashboard;

