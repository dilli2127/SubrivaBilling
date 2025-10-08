import React from 'react';
import { Card, Col, Row, Statistic, Space, Typography, List, Badge } from 'antd';
import {
  DollarOutlined,
  FileDoneOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  StockOutlined,
  WarningOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { cardGradientStyle, GRADIENTS } from '../constants';
import { DashboardItemsResponse } from '../types';

const { Title, Text } = Typography;

interface OverviewTabProps {
  DashBoardItems?: DashboardItemsResponse;
  SalesChartDataItems?: any;
  stockAlerts?: any[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  DashBoardItems,
  SalesChartDataItems,
  stockAlerts = [],
}) => {
  return (
    <div>
      {/* Primary Metrics - Row 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.purple)}
            bordered={false}
            hoverable
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <DollarOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Today's Sales
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{DashBoardItems?.result?.todaysSales || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                <ArrowUpOutlined /> +
                {DashBoardItems?.result?.todaysSalesGrowth || 12}% from
                yesterday
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.teal)}
            bordered={false}
            hoverable
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <FileDoneOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Pending Receivables
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{DashBoardItems?.result?.pendingReceivables || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                From {DashBoardItems?.result?.pendingInvoicesCount || 0}{' '}
                invoices
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.pink)}
            bordered={false}
            hoverable
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <ShoppingCartOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Monthly Revenue
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{DashBoardItems?.result?.monthlyRevenue || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                Target: ₹{DashBoardItems?.result?.monthlyTarget || '500000'}
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.orange)}
            bordered={false}
            hoverable
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <UserOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Total Customers
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                {DashBoardItems?.result?.totalCustomers || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                <ArrowUpOutlined /> +
                {DashBoardItems?.result?.newCustomersThisMonth || 5} this month
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Products"
              value={DashBoardItems?.result?.totalProducts || 0}
              prefix={<StockOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Low Stock Items"
              value={stockAlerts?.length || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Today's Billed"
              value={DashBoardItems?.result?.todaysOrders || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Profit Margin"
              value={DashBoardItems?.result?.profitMargin || 0}
              prefix={<RiseOutlined />}
              suffix="%"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <RiseOutlined style={{ color: '#1890ff' }} />
                <span>Sales & Purchase Trends</span>
              </Space>
            }
            style={{ borderRadius: 16 }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={SalesChartDataItems?.result}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#667eea"
                  strokeWidth={2}
                  name="Sales (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="purchase"
                  stroke="#f093fb"
                  strokeWidth={2}
                  name="Purchase (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <span>Low Stock Alerts</span>
              </Space>
            }
            style={{ borderRadius: 16 }}
          >
            <List
              dataSource={stockAlerts.slice(0, 3)}
              size="small"
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge status="error" />}
                    title={<Text strong>{item.name || item.item}</Text>}
                    description={`Stock: ${item.quantity} (Min: ${item.reorderLevel})`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

