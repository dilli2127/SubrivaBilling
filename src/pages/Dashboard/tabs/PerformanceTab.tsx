import React from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Space,
  Typography,
  Table,
  Tag,
  Progress,
  List,
} from 'antd';
import {
  ShopOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { SalesAnalyticsResponse } from '../types';

const { Text } = Typography;

interface PerformanceTabProps {
  SalesAnalyticsItems?: SalesAnalyticsResponse;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({
  SalesAnalyticsItems,
}) => {
  return (
    <div style={{ position: 'relative', minHeight: '70vh' }}>
      {/* UI Preview with reduced opacity */}
      <div style={{ opacity: 0.3, pointerEvents: 'none' }}>
      {/* Branch Performance */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <ShopOutlined style={{ color: '#1890ff' }} />
                <span>Branch-wise Performance</span>
              </Space>
            }
            bordered={false}
          >
            <Table
              dataSource={SalesAnalyticsItems?.result?.branchPerformance || []}
              columns={[
                {
                  title: 'Branch',
                  dataIndex: 'branchName',
                  key: 'branchName',
                },
                {
                  title: 'Sales',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (val: number) => `₹${val?.toLocaleString()}`,
                  sorter: (a: any, b: any) => a.sales - b.sales,
                },
                {
                  title: 'Orders',
                  dataIndex: 'orders',
                  key: 'orders',
                  sorter: (a: any, b: any) => a.orders - b.orders,
                },
                {
                  title: 'Avg Order',
                  dataIndex: 'avgOrder',
                  key: 'avgOrder',
                  render: (val: number) => `₹${val?.toLocaleString()}`,
                },
                {
                  title: 'Growth',
                  dataIndex: 'growth',
                  key: 'growth',
                  render: (val: number) => (
                    <Tag color={val >= 0 ? 'success' : 'error'}>
                      {val >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {Math.abs(val)}%
                    </Tag>
                  ),
                  sorter: (a: any, b: any) => a.growth - b.growth,
                },
                {
                  title: 'Performance',
                  dataIndex: 'performance',
                  key: 'performance',
                  render: (val: number) => (
                    <Progress
                      percent={val}
                      size="small"
                      status={val >= 75 ? 'success' : val >= 50 ? 'normal' : 'exception'}
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

      {/* Staff Performance */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <TeamOutlined style={{ color: '#52c41a' }} />
                <span>Sales Person Performance</span>
              </Space>
            }
            bordered={false}
          >
            <Table
              dataSource={SalesAnalyticsItems?.result?.staffPerformance || []}
              columns={[
                {
                  title: 'Name',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Sales',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (val: number) => `₹${val?.toLocaleString()}`,
                  sorter: (a: any, b: any) => a.sales - b.sales,
                },
                {
                  title: 'Orders',
                  dataIndex: 'orders',
                  key: 'orders',
                  sorter: (a: any, b: any) => a.orders - b.orders,
                },
                {
                  title: 'Customers',
                  dataIndex: 'customers',
                  key: 'customers',
                  sorter: (a: any, b: any) => a.customers - b.customers,
                },
                {
                  title: 'Avg Deal Size',
                  dataIndex: 'avgDealSize',
                  key: 'avgDealSize',
                  render: (val: number) => `₹${val?.toLocaleString()}`,
                },
                {
                  title: 'Target Achievement',
                  dataIndex: 'targetAchievement',
                  key: 'targetAchievement',
                  render: (val: number) => (
                    <Progress
                      percent={val}
                      size="small"
                      strokeColor={
                        val >= 100
                          ? '#52c41a'
                          : val >= 75
                            ? '#1890ff'
                            : '#fa8c16'
                      }
                    />
                  ),
                  sorter: (a: any, b: any) =>
                    a.targetAchievement - b.targetAchievement,
                },
                {
                  title: 'Rating',
                  dataIndex: 'rating',
                  key: 'rating',
                  render: (val: string) => (
                    <Tag
                      color={
                        val === 'Excellent'
                          ? 'success'
                          : val === 'Good'
                            ? 'processing'
                            : val === 'Average'
                              ? 'warning'
                              : 'default'
                      }
                    >
                      {val}
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

      {/* Additional Metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="User Activity Log" bordered={false}>
            <List
              dataSource={SalesAnalyticsItems?.result?.userActivityLog || []}
              size="small"
              renderItem={(activity: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text>{activity.userName}</Text>}
                    description={activity.action}
                  />
                  <Text type="secondary">{activity.time}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Performance Summary" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Total Branches"
                  value={
                    SalesAnalyticsItems?.result?.branchPerformance?.length || 0
                  }
                  prefix={<ShopOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Total Staff"
                  value={
                    SalesAnalyticsItems?.result?.staffPerformance?.length || 0
                  }
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Best Branch"
                  value={
                    SalesAnalyticsItems?.result?.bestBranch?.name || 'N/A'
                  }
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Top Performer"
                  value={
                    SalesAnalyticsItems?.result?.topPerformer?.name || 'N/A'
                  }
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      </div>
      
      {/* Centered Coming Soon Message */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          width: '90%',
          maxWidth: '600px',
        }}
      >
        <Card
          style={{
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <InfoCircleOutlined style={{ fontSize: 64, color: '#1890ff' }} />
            <div>
              <Typography.Title level={2} style={{ margin: 0 }}>
                Coming Soon!
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                This feature is currently under development.
              </Typography.Text>
            </div>
            <Typography.Paragraph style={{ margin: 0, fontSize: 14 }}>
              The API integration is in progress and will be available soon.
              Stay tuned for updates!
            </Typography.Paragraph>
          </Space>
        </Card>
      </div>
    </div>
  );
};

