import React from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Space,
  Typography,
  List,
  Progress,
  Divider,
} from 'antd';
import {
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
} from 'recharts';
import { COLORS } from '../constants';
import { SalesAnalyticsResponse } from '../types';

const { Text } = Typography;

interface SalesAnalysisTabProps {
  topProducts?: any[];
  topCustomers?: any[];
  SalesAnalyticsItems?: SalesAnalyticsResponse;
}

export const SalesAnalysisTab: React.FC<SalesAnalysisTabProps> = ({
  topProducts = [],
  topCustomers = [],
  SalesAnalyticsItems,
}) => {
  return (
    <div>
      {/* Top Products & Customers */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined style={{ color: '#52c41a' }} />
                <span>Top Products</span>
              </Space>
            }
            bordered={false}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <RechartsTooltip />
                <Bar dataKey="sales" fill="#52c41a" radius={[0, 10, 10, 0]}>
                  {topProducts.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TeamOutlined style={{ color: '#722ed1' }} />
                <span>Top Customers</span>
              </Space>
            }
            bordered={false}
          >
            <List
              dataSource={topCustomers.slice(0, 5)}
              renderItem={(customer: any, index: number) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: COLORS[index % COLORS.length],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      >
                        {index + 1}
                      </div>
                    }
                    title={<Text strong>{customer.name}</Text>}
                    description={`${customer.invoiceCount} invoices`}
                  />
                  <Space direction="vertical" align="end" size={0}>
                    <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                      ₹{customer.totalPurchase?.toLocaleString()}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Category-wise Sales */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Top Selling Categories" bordered={false}>
            <List
              dataSource={SalesAnalyticsItems?.result?.topCategories || []}
              renderItem={(cat: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text strong>{cat.name}</Text>}
                    description={`${cat.productCount} products`}
                  />
                  <Space direction="vertical" align="end">
                    <Text strong>₹{cat.sales?.toLocaleString()}</Text>
                    <Progress
                      percent={cat.percentage}
                      size="small"
                      style={{ width: 100 }}
                    />
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sales Performance Metrics" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Avg. Order Value"
                  value={SalesAnalyticsItems?.result?.avgOrderValue || 0}
                  prefix="₹"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Conversion Rate"
                  value={SalesAnalyticsItems?.result?.conversionRate || 0}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Total Orders"
                  value={SalesAnalyticsItems?.result?.totalOrders || 0}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Total Revenue"
                  value={SalesAnalyticsItems?.result?.totalRevenue || 0}
                  prefix="₹"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Monthly Sales Target Progress</Text>
              <Progress
                percent={SalesAnalyticsItems?.result?.salesTargetProgress || 0}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                status="active"
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

