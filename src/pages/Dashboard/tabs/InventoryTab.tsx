import React from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Space,
  Typography,
  List,
  Tag,
} from 'antd';
import {
  DollarOutlined,
  HourglassOutlined,
  FireOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { cardGradientStyle, GRADIENTS } from '../constants';
import { InventoryDataResponse } from '../types';

const { Title, Text } = Typography;

interface InventoryTabProps {
  InventoryMetricsItems?: InventoryDataResponse;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  InventoryMetricsItems,
}) => {
  return (
    <div>
      {/* Inventory Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.lightPink)}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <DollarOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Total Stock Value
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{InventoryMetricsItems?.result?.totalStockValue || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                {InventoryMetricsItems?.result?.totalItems || 0} items
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.peach)}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <HourglassOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Dead Stock
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                {InventoryMetricsItems?.result?.deadStockCount || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                Not sold in 90+ days
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.darkBlue)}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <FireOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Fast Moving
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                {InventoryMetricsItems?.result?.fastMovingCount || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                High turnover items
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.pastel)}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <SyncOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Slow Moving
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                {InventoryMetricsItems?.result?.slowMovingCount || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                Low turnover items
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Stock Status Details */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Stock Status Breakdown" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card style={{ background: '#f6ffed', border: 'none' }}>
                  <Statistic
                    title="In Stock"
                    value={InventoryMetricsItems?.result?.inStockCount || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ background: '#fff1f0', border: 'none' }}>
                  <Statistic
                    title="Out of Stock"
                    value={InventoryMetricsItems?.result?.outOfStockCount || 0}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ background: '#fff7e6', border: 'none' }}>
                  <Statistic
                    title="Low Stock"
                    value={InventoryMetricsItems?.result?.lowStockCount || 0}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ background: '#f0f5ff', border: 'none' }}>
                  <Statistic
                    title="Reorder Needed"
                    value={InventoryMetricsItems?.result?.reorderCount || 0}
                    prefix={<SyncOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Inventory Turnover" bordered={false}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={InventoryMetricsItems?.result?.categoryWiseStock || []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Dead Stock & Fast/Slow Moving Lists */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <HourglassOutlined style={{ color: '#fa8c16' }} />
                <span>Dead Stock Items</span>
              </Space>
            }
            bordered={false}
          >
            <List
              dataSource={InventoryMetricsItems?.result?.deadStockItems || []}
              size="small"
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text>{item.name}</Text>}
                    description={`Last sold: ${item.lastSoldDays} days ago`}
                  />
                  <Text type="secondary">Qty: {item.quantity}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <FireOutlined style={{ color: '#52c41a' }} />
                <span>Fast Moving Items</span>
              </Space>
            }
            bordered={false}
          >
            <List
              dataSource={InventoryMetricsItems?.result?.fastMovingItems || []}
              size="small"
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text>{item.name}</Text>}
                    description={`Turnover: ${item.turnoverRate}x/month`}
                  />
                  <Tag color="success">{item.soldCount} sold</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <SyncOutlined style={{ color: '#1890ff' }} />
                <span>Slow Moving Items</span>
              </Space>
            }
            bordered={false}
          >
            <List
              dataSource={InventoryMetricsItems?.result?.slowMovingItems || []}
              size="small"
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text>{item.name}</Text>}
                    description={`Turnover: ${item.turnoverRate}x/month`}
                  />
                  <Tag color="warning">{item.soldCount} sold</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

