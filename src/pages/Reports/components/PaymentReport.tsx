import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Typography, Empty } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { useReportDataContext } from '../context/ReportDataContext';
import dayjs from 'dayjs';

const { Text } = Typography;
const COLORS = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];

const PaymentReport: React.FC = () => {
  // Get data from context instead of making API calls
  const {
    paymentCollectionData: paymentCollectionDataContext,
    outstandingPaymentsData: outstandingPaymentsDataContext,
  } = useReportDataContext();
  
  // Extract data from context
  const paymentCollectionData = paymentCollectionDataContext?.result || {};
  const outstandingPaymentsData = outstandingPaymentsDataContext?.result || {};
  
  const collectionSummary = paymentCollectionData?.summary || {};
  const paymentModeBreakdown = collectionSummary.payment_mode_breakdown || [];
  const outstandingBills = outstandingPaymentsData?.outstanding_bills || [];
  const outstandingSummary = outstandingPaymentsData?.summary || {};
  
  // Calculate metrics
  const totalCollected = parseFloat(collectionSummary.total_collected) || 0;
  const totalOutstanding = parseFloat(outstandingSummary.total_outstanding_amount) || 0;
  const totalBills = parseInt(outstandingSummary.total_outstanding_bills) || 0;
  const collectionRate = totalCollected > 0 && totalOutstanding > 0 
    ? ((totalCollected / (totalCollected + totalOutstanding)) * 100).toFixed(2)
    : 0;
  
  // Prepare payment method chart data
  const paymentMethodData = paymentModeBreakdown.map((item: any) => ({
    method: item.payment_mode || 'Cash',
    amount: parseFloat(item.total_amount) || 0,
    transactions: parseInt(item.transaction_count) || 0,
  }));
  
  // Calculate percentages for payment methods
  const paymentMethodsWithPercentage = paymentMethodData.map((item: any) => ({
    ...item,
    percentage: totalCollected > 0 ? ((item.amount / totalCollected) * 100).toFixed(1) : 0,
  }));
  
  // Separate overdue bills (example: > 30 days)
  const overdueAmount = outstandingBills
    .filter((bill: any) => {
      const billDate = dayjs(bill.date);
      const daysOld = dayjs().diff(billDate, 'day');
      return daysOld > 30;
    })
    .reduce((sum: number, bill: any) => sum + parseFloat(bill.outstanding_amount || 0), 0);

  return (
    <div>
      {/* Payment Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#f6ffed' }}>
            <Statistic
              title="Total Collected"
              value={totalCollected}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#fff7e6' }}>
            <Statistic
              title="Outstanding"
              value={totalOutstanding}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#fff1f0' }}>
            <Statistic
              title="Overdue (>30d)"
              value={overdueAmount}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#e6f7ff' }}>
            <Statistic
              title="Collection Rate"
              value={collectionRate}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Method Analysis */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Payment Method Distribution" style={{ borderRadius: 12 }}>
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ method, percentage }) => `${method}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {paymentMethodData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No payment method data available" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Payment Method Breakdown" style={{ borderRadius: 12 }}>
            <Table
              dataSource={paymentMethodsWithPercentage}
              rowKey="method"
              columns={[
                { title: 'Method', dataIndex: 'method', key: 'method' },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (val: number) => `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
                {
                  title: 'Transactions',
                  dataIndex: 'transactions',
                  key: 'transactions',
                },
                {
                  title: 'Share',
                  dataIndex: 'percentage',
                  key: 'percentage',
                  render: (val: number) => (
                    <span>
                      {val}%
                      <Progress percent={parseFloat(val.toString())} size="small" style={{ marginTop: 4 }} />
                    </span>
                  ),
                },
              ]}
              pagination={false}
              size="small"
              locale={{ emptyText: 'No payment data available' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Outstanding Receivables */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title={`Outstanding Receivables (${totalBills} Bills)`} style={{ borderRadius: 12 }}>
            <Table
              dataSource={outstandingBills}
              rowKey="_id"
              columns={[
                { 
                  title: 'Invoice No', 
                  dataIndex: 'invoice_no', 
                  key: 'invoice_no',
                  render: (invoice: string) => <Text strong>{invoice}</Text>
                },
                { 
                  title: 'Customer', 
                  key: 'customer',
                  render: (record: any) => (
                    <div>
                      <div>{record.customerDetails?.name || 'Unknown'}</div>
                      {record.customerDetails?.phone && (
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {record.customerDetails.phone}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  title: 'Bill Date',
                  dataIndex: 'date',
                  key: 'date',
                  render: (date: string) => dayjs(date).format('DD MMM YYYY'),
                },
                {
                  title: 'Total Amount',
                  dataIndex: 'total_amount',
                  key: 'total_amount',
                  render: (val: string) => `₹${parseFloat(val || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
                {
                  title: 'Paid',
                  dataIndex: 'paid_amount',
                  key: 'paid_amount',
                  render: (val: string) => (
                    <Text style={{ color: '#52c41a' }}>
                      ₹{parseFloat(val || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  ),
                },
                {
                  title: 'Outstanding',
                  dataIndex: 'outstanding_amount',
                  key: 'outstanding_amount',
                  render: (val: string) => (
                    <Text strong style={{ color: '#ff4d4f' }}>
                      ₹{parseFloat(val || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  ),
                  sorter: (a: any, b: any) => parseFloat(a.outstanding_amount) - parseFloat(b.outstanding_amount),
                },
                {
                  title: 'Days Old',
                  key: 'daysOld',
                  render: (record: any) => {
                    const daysOld = dayjs().diff(dayjs(record.date), 'day');
                    return (
                      <Tag color={daysOld > 60 ? 'red' : daysOld > 30 ? 'orange' : 'default'}>
                        {daysOld} days
                      </Tag>
                    );
                  },
                  sorter: (a: any, b: any) => {
                    const daysA = dayjs().diff(dayjs(a.date), 'day');
                    const daysB = dayjs().diff(dayjs(b.date), 'day');
                    return daysA - daysB;
                  },
                },
                {
                  title: 'Priority',
                  key: 'priority',
                  render: (_: any, record: any) => {
                    const outstanding = parseFloat(record.outstanding_amount || 0);
                    const daysOld = dayjs().diff(dayjs(record.date), 'day');
                    const priority = outstanding > 5000 && daysOld > 30 ? 'High' : outstanding > 2000 || daysOld > 45 ? 'Medium' : 'Low';
                    const color = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'default';
                    return <Tag color={color}>{priority}</Tag>;
                  },
                },
              ]}
              pagination={{ pageSize: 10 }}
              size="small"
              locale={{ emptyText: 'No outstanding bills' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentReport;
