import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import {
  UserOutlined,
  RiseOutlined,
  TeamOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { mockCustomerSegments, mockSalesData, mockTopCustomers } from '../utils/mockData';

const CustomerReport: React.FC = () => {
  return (
    <div>
      {/* Customer Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <UserOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <Statistic title="Total Customers" value={510} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <RiseOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <Statistic title="New This Month" value={45} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <TeamOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <Statistic title="VIP Customers" value={85} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <DollarOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
            <Statistic title="Avg Lifetime Value" value={643} prefix="₹" valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      {/* Customer Segmentation */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Customer Segmentation" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockCustomerSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockCustomerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Customer Growth Trend" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} name="New Customers" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top Customers Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Customer Details" style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockTopCustomers}
              columns={[
                { title: 'Customer Name', dataIndex: 'name', key: 'name' },
                {
                  title: 'Total Purchase',
                  dataIndex: 'totalPurchase',
                  key: 'totalPurchase',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                  sorter: (a: any, b: any) => a.totalPurchase - b.totalPurchase,
                },
                {
                  title: 'Orders',
                  dataIndex: 'orders',
                  key: 'orders',
                  sorter: (a: any, b: any) => a.orders - b.orders,
                },
                {
                  title: 'Avg Order Value',
                  key: 'avgOrder',
                  render: (_: any, record: any) => `₹${Math.round(record.totalPurchase / record.orders).toLocaleString()}`,
                },
                {
                  title: 'Outstanding',
                  dataIndex: 'outstanding',
                  key: 'outstanding',
                  render: (val: number) => (
                    <Tag color={val > 0 ? 'orange' : 'green'}>
                      ₹{val.toLocaleString()}
                    </Tag>
                  ),
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_: any, record: any) => (
                    <Tag color={record.outstanding === 0 ? 'success' : 'warning'}>
                      {record.outstanding === 0 ? 'Clear' : 'Pending'}
                    </Tag>
                  ),
                },
              ]}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerReport;

