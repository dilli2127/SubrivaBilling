import React from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Space,
  Typography,
  Divider,
  Table,
  Tag,
  Progress,
} from 'antd';
import {
  WalletOutlined,
  BankOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { cardGradientStyle, GRADIENTS } from '../constants';
import { FinancialDataResponse } from '../types';

const { Title, Text } = Typography;

interface FinanceTabProps {
  FinancialDataItems?: FinancialDataResponse;
  recentInvoices?: any[];
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  FinancialDataItems,
  recentInvoices = [],
}) => {
  return (
    <div>
      {/* Financial Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.green)}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <WalletOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Today's Profit
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{FinancialDataItems?.result?.todayProfit?.amount || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                Margin: {FinancialDataItems?.result?.todayProfit?.margin || 0}%
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.red)}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <BankOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Pending Payables
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{FinancialDataItems?.result?.pendingPayables?.amount || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                To {FinancialDataItems?.result?.pendingPayables?.vendorCount || 0} vendors
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.yellow)}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <ArrowDownOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Monthly Expenses
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{FinancialDataItems?.result?.monthlyExpenses?.amount || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                <ArrowUpOutlined /> +
                {FinancialDataItems?.result?.monthlyExpenses?.growth || 0}% vs last month
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(GRADIENTS.blue)}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <SwapOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Cash Flow
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{FinancialDataItems?.result?.cashFlow?.amount || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                {FinancialDataItems?.result?.cashFlow?.status || 'Neutral'}
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Comparative Analytics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Week-over-Week" bordered={false}>
            <Statistic
              title="Current Week Sales"
              value={FinancialDataItems?.result?.currentWeekSales?.amount || 0}
              prefix="₹"
              valueStyle={{ color: '#3f8600' }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space>
              <Text type="secondary">Last Week:</Text>
              <Text>₹{FinancialDataItems?.result?.currentWeekSales?.lastWeek || 0}</Text>
            </Space>
            <br />
            <Space>
              <Text type="secondary">Growth:</Text>
              {(FinancialDataItems?.result?.currentWeekSales?.growth || 0) >= 0 ? (
                <Text style={{ color: '#3f8600' }}>
                  <ArrowUpOutlined />
                  {FinancialDataItems?.result?.currentWeekSales?.growth || 0}%
                </Text>
              ) : (
                <Text style={{ color: '#cf1322' }}>
                  <ArrowDownOutlined />
                  {Math.abs(FinancialDataItems?.result?.currentWeekSales?.growth || 0)}
                  %
                </Text>
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Month-over-Month" bordered={false}>
            <Statistic
              title="Current Month Sales"
              value={FinancialDataItems?.result?.currentMonthSales?.amount || 0}
              prefix="₹"
              valueStyle={{ color: '#1890ff' }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space>
              <Text type="secondary">Last Month:</Text>
              <Text>₹{FinancialDataItems?.result?.currentMonthSales?.lastMonth || 0}</Text>
            </Space>
            <br />
            <Space>
              <Text type="secondary">Growth:</Text>
              {(FinancialDataItems?.result?.currentMonthSales?.growth || 0) >= 0 ? (
                <Text style={{ color: '#3f8600' }}>
                  <ArrowUpOutlined />
                  {FinancialDataItems?.result?.currentMonthSales?.growth || 0}%
                </Text>
              ) : (
                <Text style={{ color: '#cf1322' }}>
                  <ArrowDownOutlined />
                  {Math.abs(
                    FinancialDataItems?.result?.currentMonthSales?.growth || 0
                  )}
                  %
                </Text>
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Year-over-Year" bordered={false}>
            <Statistic
              title="Current Year Sales"
              value={FinancialDataItems?.result?.currentYearSales?.amount || 0}
              prefix="₹"
              valueStyle={{ color: '#722ed1' }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space>
              <Text type="secondary">Last Year:</Text>
              <Text>₹{FinancialDataItems?.result?.currentYearSales?.lastYear || 0}</Text>
            </Space>
            <br />
            <Space>
              <Text type="secondary">Growth:</Text>
              {(FinancialDataItems?.result?.currentYearSales?.growth || 0) >= 0 ? (
                <Text style={{ color: '#3f8600' }}>
                  <ArrowUpOutlined />
                  {FinancialDataItems?.result?.currentYearSales?.growth || 0}%
                </Text>
              ) : (
                <Text style={{ color: '#cf1322' }}>
                  <ArrowDownOutlined />
                  {Math.abs(FinancialDataItems?.result?.currentYearSales?.growth || 0)}
                  %
                </Text>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Payment Collections & Recent Invoices */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Payment Collection Status" bordered={false}>
            <Progress
              percent={FinancialDataItems?.result?.paymentCollectionRate || 0}
              strokeColor="#52c41a"
              status="active"
            />
            <Divider />
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Collected"
                  value={FinancialDataItems?.result?.collectedAmount || 0}
                  prefix="₹"
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Pending"
                  value={FinancialDataItems?.result?.pendingAmount || 0}
                  prefix="₹"
                  valueStyle={{ fontSize: 16, color: '#fa8c16' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Overdue"
                  value={FinancialDataItems?.result?.overdueAmount || 0}
                  prefix="₹"
                  valueStyle={{ fontSize: 16, color: '#f5222d' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Invoices" bordered={false}>
            <Table
              dataSource={recentInvoices.slice(0, 5)}
              columns={[
                {
                  title: 'Invoice',
                  dataIndex: 'invoice',
                  width: 100,
                },
                {
                  title: 'Customer',
                  dataIndex: 'customer',
                  ellipsis: true,
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  width: 90,
                  render: (amt: number) => `₹${amt}`,
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  width: 80,
                  render: (status: string) => (
                    <Tag
                      color={
                        status === 'Paid'
                          ? 'success'
                          : status === 'Partial'
                            ? 'warning'
                            : 'error'
                      }
                    >
                      {status}
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

