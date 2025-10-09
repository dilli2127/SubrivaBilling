import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Typography } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockPaymentMethods, mockTopCustomers, COLORS } from '../utils/mockData';

const { Text } = Typography;

const PaymentReport: React.FC = () => {
  return (
    <div>
      {/* Payment Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#f6ffed' }}>
            <Statistic
              title="Total Collected"
              value={356000}
              prefix="₹"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#fff7e6' }}>
            <Statistic
              title="Pending"
              value={28000}
              prefix="₹"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#fff1f0' }}>
            <Statistic
              title="Overdue"
              value={11000}
              prefix="₹"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#e6f7ff' }}>
            <Statistic
              title="Collection Rate"
              value={92.7}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Method Analysis */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Payment Method Distribution" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockPaymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ method, percentage }) => `${method}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {mockPaymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Payment Method Breakdown" style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockPaymentMethods}
              columns={[
                { title: 'Method', dataIndex: 'method', key: 'method' },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                },
                {
                  title: 'Transactions',
                  dataIndex: 'transactions',
                  key: 'transactions',
                },
                {
                  title: 'Share',
                  dataIndex: 'percentage',
                  key: 'percentage',
                  render: (val: number) => (
                    <span>
                      {val}%
                      <Progress percent={val} size="small" style={{ marginTop: 4 }} />
                    </span>
                  ),
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Outstanding Receivables */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Outstanding Receivables by Customer" style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockTopCustomers.filter(c => c.outstanding > 0)}
              columns={[
                { title: 'Customer Name', dataIndex: 'name', key: 'name' },
                {
                  title: 'Total Purchase',
                  dataIndex: 'totalPurchase',
                  key: 'totalPurchase',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                },
                {
                  title: 'Outstanding',
                  dataIndex: 'outstanding',
                  key: 'outstanding',
                  render: (val: number) => (
                    <Text strong style={{ color: '#ff4d4f' }}>
                      ₹{val.toLocaleString()}
                    </Text>
                  ),
                  sorter: (a: any, b: any) => a.outstanding - b.outstanding,
                },
                {
                  title: 'Days Overdue',
                  key: 'daysOverdue',
                  render: () => Math.floor(Math.random() * 30) + 1,
                  sorter: (a: any, b: any) => a.outstanding - b.outstanding,
                },
                {
                  title: 'Priority',
                  key: 'priority',
                  render: (_: any, record: any) => (
                    <Tag color={record.outstanding > 5000 ? 'red' : 'orange'}>
                      {record.outstanding > 5000 ? 'High' : 'Medium'}
                    </Tag>
                  ),
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentReport;

