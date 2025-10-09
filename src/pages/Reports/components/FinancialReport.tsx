import React from 'react';
import { Card, Row, Col, Statistic, Table, Typography } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { mockSalesData } from '../utils/mockData';

const { Text } = Typography;

const FinancialReport: React.FC = () => {
  return (
    <div>
      {/* P&L Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12, textAlign: 'center', background: '#f6ffed' }}>
            <Statistic
              title="Total Revenue"
              value={328000}
              prefix="₹"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12, textAlign: 'center', background: '#fff7e6' }}>
            <Statistic
              title="Total Expenses"
              value={230894}
              prefix="₹"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12, textAlign: 'center', background: '#e6f7ff' }}>
            <Statistic
              title="Net Profit"
              value={97106}
              prefix="₹"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Breakdown */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Profit & Loss Statement" style={{ borderRadius: 12 }}>
            <Table
              dataSource={[
                { category: 'Revenue', amount: 328000, type: 'income' },
                { category: 'Cost of Goods Sold', amount: -192000, type: 'expense' },
                { category: 'Gross Profit', amount: 136000, type: 'income' },
                { category: 'Operating Expenses', amount: -28500, type: 'expense' },
                { category: 'Staff Salaries', amount: -8500, type: 'expense' },
                { category: 'Rent & Utilities', amount: -1894, type: 'expense' },
                { category: 'Net Profit', amount: 97106, type: 'profit' },
              ]}
              columns={[
                { title: 'Category', dataIndex: 'category', key: 'category' },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  align: 'right',
                  render: (amt: number, record: any) => (
                    <Text
                      strong={record.type === 'profit'}
                      style={{
                        color: record.type === 'income' || record.type === 'profit' ? '#52c41a' : '#ff4d4f',
                      }}
                    >
                      ₹{Math.abs(amt).toLocaleString()}
                    </Text>
                  ),
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Monthly Comparison" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#1890ff" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="profit" stroke="#52c41a" strokeWidth={2} name="Profit" />
                <Line type="monotone" dataKey="cost" stroke="#ff4d4f" strokeWidth={2} name="Costs" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Cash Flow */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Cash Flow Analysis" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col xs={24} md={6}>
                <Statistic title="Cash Inflow" value={328000} prefix="₹" valueStyle={{ color: '#52c41a' }} />
              </Col>
              <Col xs={24} md={6}>
                <Statistic title="Cash Outflow" value={230894} prefix="₹" valueStyle={{ color: '#ff4d4f' }} />
              </Col>
              <Col xs={24} md={6}>
                <Statistic title="Net Cash Flow" value={97106} prefix="₹" valueStyle={{ color: '#1890ff' }} />
              </Col>
              <Col xs={24} md={6}>
                <Statistic title="Cash Balance" value={450000} prefix="₹" valueStyle={{ color: '#722ed1' }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinancialReport;

