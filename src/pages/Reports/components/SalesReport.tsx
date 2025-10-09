import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { mockProductPerformance, mockSalesData, mockTopCustomers } from '../utils/mockData';

const SalesReport: React.FC = () => {
  return (
    <div>
      {/* Sales Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Total Sales" value={328000} prefix="₹" valueStyle={{ color: '#1890ff' }} />
            <Progress percent={82} size="small" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Avg Order Value" value={356} prefix="₹" valueStyle={{ color: '#52c41a' }} />
            <Progress percent={68} size="small" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Conversion Rate" value={24.5} suffix="%" precision={1} valueStyle={{ color: '#722ed1' }} />
            <Progress percent={74} size="small" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Repeat Customer Rate" value={46} suffix="%" valueStyle={{ color: '#fa8c16' }} />
            <Progress percent={46} size="small" />
          </Card>
        </Col>
      </Row>

      {/* Sales by Category & Orders */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Sales by Category" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockProductPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sales" fill="#1890ff" name="Sales (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Monthly Orders Trend" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockSalesData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="orders" stroke="#8884d8" fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top Customers */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title={<><TrophyOutlined /> Top 5 Customers</>} style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockTopCustomers}
              columns={[
                {
                  title: 'Rank',
                  key: 'rank',
                  width: 70,
                  render: (_: any, __: any, index: number) => (
                    <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'default'}>
                      #{index + 1}
                    </Tag>
                  ),
                },
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
                  title: 'Outstanding',
                  dataIndex: 'outstanding',
                  key: 'outstanding',
                  render: (val: number) => (
                    <span style={{ color: val > 0 ? '#fa8c16' : '#52c41a' }}>
                      ₹{val.toLocaleString()}
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
    </div>
  );
};

export default SalesReport;

