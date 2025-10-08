import React from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Space,
  Typography,
  Table,
  List,
  Progress,
  Divider,
} from 'antd';
import {
  TruckOutlined,
  SwapOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
} from 'recharts';
import { COLORS } from '../constants';
import { OperationsDataResponse } from '../types';

const { Text } = Typography;

interface OperationsTabProps {
  OperationsDataItems?: OperationsDataResponse;
}

export const OperationsTab: React.FC<OperationsTabProps> = ({
  OperationsDataItems,
}) => {
  return (
    <div>
      {/* Operations Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Vendors"
              value={OperationsDataItems?.result?.totalVendors || 0}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Returns This Month"
              value={OperationsDataItems?.result?.returnsThisMonth || 0}
              prefix={<SwapOutlined />}
              valueStyle={{ color: '#fa8c16' }}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  / {OperationsDataItems?.result?.totalOrders || 0}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Return Rate"
              value={OperationsDataItems?.result?.returnRate || 0}
              suffix="%"
              precision={1}
              valueStyle={{
                color:
                  (OperationsDataItems?.result?.returnRate || 0) > 5
                    ? '#cf1322'
                    : '#3f8600',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Pending Orders"
              value={OperationsDataItems?.result?.pendingOrders || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Methods Breakdown */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Payment Methods (This Month)" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={OperationsDataItems?.result?.paymentMethods || []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" name="Amount (₹)">
                  {(OperationsDataItems?.result?.paymentMethods || []).map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Credit vs Cash Sales" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card style={{ background: '#f6ffed', border: 'none' }}>
                  <Statistic
                    title="Cash Sales"
                    value={OperationsDataItems?.result?.cashSales || 0}
                    prefix="₹"
                    valueStyle={{ color: '#52c41a', fontSize: 20 }}
                  />
                  <Text type="secondary">
                    {OperationsDataItems?.result?.cashSalesPercentage || 0}% of
                    total
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ background: '#fff7e6', border: 'none' }}>
                  <Statistic
                    title="Credit Sales"
                    value={OperationsDataItems?.result?.creditSales || 0}
                    prefix="₹"
                    valueStyle={{ color: '#fa8c16', fontSize: 20 }}
                  />
                  <Text type="secondary">
                    {OperationsDataItems?.result?.creditSalesPercentage || 0}% of
                    total
                  </Text>
                </Card>
              </Col>
            </Row>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Credit Sales Ratio</Text>
              <Progress
                percent={
                  OperationsDataItems?.result?.creditSalesPercentage || 0
                }
                strokeColor="#fa8c16"
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Returns & Top Vendors */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SwapOutlined style={{ color: '#fa8c16' }} />
                <span>Recent Returns</span>
              </Space>
            }
            bordered={false}
          >
            <Table
              dataSource={OperationsDataItems?.result?.recentReturns || []}
              columns={[
                { title: 'Invoice', dataIndex: 'invoice', width: 100 },
                { title: 'Product', dataIndex: 'product', ellipsis: true },
                {
                  title: 'Reason',
                  dataIndex: 'reason',
                  width: 120,
                  ellipsis: true,
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  width: 90,
                  render: (amt: number) => `₹${amt}`,
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TruckOutlined style={{ color: '#1890ff' }} />
                <span>Top Vendors</span>
              </Space>
            }
            bordered={false}
          >
            <List
              dataSource={OperationsDataItems?.result?.topVendors || []}
              renderItem={(vendor: any, index: number) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 35,
                          height: 35,
                          borderRadius: '50%',
                          background: COLORS[index % COLORS.length],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: 12,
                        }}
                      >
                        {index + 1}
                      </div>
                    }
                    title={<Text>{vendor.name}</Text>}
                    description={`${vendor.purchaseCount} purchases`}
                  />
                  <Text strong>₹{vendor.totalPurchase?.toLocaleString()}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

