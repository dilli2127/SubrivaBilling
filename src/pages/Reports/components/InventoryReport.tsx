import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress } from 'antd';
import {
  StockOutlined,
  DollarOutlined,
  FallOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { mockSalesData, mockProductPerformance, COLORS } from '../utils/mockData';

const InventoryReport: React.FC = () => {
  return (
    <div>
      {/* Inventory Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <StockOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <Statistic title="Total Products" value={1245} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <DollarOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <Statistic title="Stock Value" value={850000} prefix="₹" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <FallOutlined style={{ fontSize: 32, color: '#ff4d4f', marginBottom: 8 }} />
            <Statistic title="Low Stock Items" value={42} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <SwapOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
            <Statistic title="Out of Stock" value={18} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      {/* Stock Movement */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Stock Movement (Last 6 Months)" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#1890ff" strokeWidth={2} name="Sales Units" />
                <Line type="monotone" dataKey="orders" stroke="#52c41a" strokeWidth={2} name="Purchase Units" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Category-wise Stock Distribution" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockProductPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sales"
                >
                  {mockProductPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Stock Status Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Category-wise Stock Analysis" style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockProductPerformance}
              columns={[
                { title: 'Category', dataIndex: 'name', key: 'name' },
                {
                  title: 'Sales',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                },
                {
                  title: 'Profit',
                  dataIndex: 'profit',
                  key: 'profit',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                },
                {
                  title: 'Profit Margin',
                  dataIndex: 'margin',
                  key: 'margin',
                  render: (val: number) => (
                    <Tag color={val > 25 ? 'green' : val > 15 ? 'orange' : 'red'}>
                      {val.toFixed(1)}%
                    </Tag>
                  ),
                },
                {
                  title: 'Performance',
                  key: 'performance',
                  render: (_: any, record: any) => (
                    <Progress
                      percent={Math.round((record.sales / 150000) * 100)}
                      size="small"
                      status={record.margin > 25 ? 'success' : 'normal'}
                    />
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

export default InventoryReport;

