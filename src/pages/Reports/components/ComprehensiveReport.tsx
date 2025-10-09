import React from 'react';
import { Card, Row, Col, Typography, Statistic } from 'antd';
import {
  DollarOutlined,
  FundOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  RiseOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts';
import { mockSalesData, mockCustomerSegments, mockProductPerformance, mockPaymentMethods, COLORS } from '../utils/mockData';

const { Text } = Typography;

const ComprehensiveReport: React.FC = () => {
  return (
    <div>
      {/* Key Performance Indicators */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
            <DollarOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Total Revenue</Text>}
              value={328000}
              prefix="₹"
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              <RiseOutlined /> +18.5% vs last period
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' }}>
            <FundOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Net Profit</Text>}
              value={97106}
              prefix="₹"
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              Margin: 29.6%
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' }}>
            <ShoppingCartOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Total Orders</Text>}
              value={921}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              Avg: ₹356 per order
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff' }}>
            <UserOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Active Customers</Text>}
              value={510}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              <RiseOutlined /> +45 new this month
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Sales & Profit Trend */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title={<><LineChartOutlined /> Sales & Profit Trend</>} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales (₹)" />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={3} name="Profit (₹)" />
                <Line type="monotone" dataKey="cost" stroke="#ff8042" strokeWidth={2} name="Cost (₹)" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><PieChartOutlined /> Customer Segments</>} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockCustomerSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
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
      </Row>

      {/* Product Performance & Payment Methods */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<><BarChartOutlined /> Top Product Categories</>} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockProductPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales (₹)" />
                <Bar dataKey="profit" fill="#82ca9d" name="Profit (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Payment Method Distribution" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockPaymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
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
      </Row>
    </div>
  );
};

export default ComprehensiveReport;

