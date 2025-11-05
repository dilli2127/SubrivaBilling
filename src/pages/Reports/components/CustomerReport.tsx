import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Empty } from 'antd';
import {
  UserOutlined,
  RiseOutlined,
  TeamOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useReportDataContext } from '../context/ReportDataContext';

const CustomerReport: React.FC = () => {
  // Get data from context instead of making API calls
  const {
    customerSalesData: customerSalesDataContext,
    topCustomersData: topCustomersDataContext,
  } = useReportDataContext();
  
  // Extract data from context
  const customerSalesData = customerSalesDataContext?.result || {};
  const topCustomersData = topCustomersDataContext?.result || {};
  
  const customers = customerSalesData?.customers || [];
  const topCustomers = topCustomersData?.top_customers || [];
  
  // Calculate metrics
  const totalCustomers = customers.length;
  const customersWithData = customers.filter((c: any) => parseFloat(c.total_purchase) > 0);
  const avgLifetimeValue = customersWithData.length > 0 
    ? customersWithData.reduce((sum: number, c: any) => sum + parseFloat(c.total_purchase), 0) / customersWithData.length 
    : 0;
  
  // VIP customers (customers with purchase > average * 1.5)
  const vipCustomers = customersWithData.filter((c: any) => parseFloat(c.total_purchase) > avgLifetimeValue * 1.5);
  
  // Segment customers by purchase value
  const segmentCustomers = () => {
    const segments = [
      { name: 'High Value', value: 0, color: '#52c41a', min: avgLifetimeValue * 1.5 },
      { name: 'Medium Value', value: 0, color: '#1890ff', min: avgLifetimeValue * 0.7, max: avgLifetimeValue * 1.5 },
      { name: 'Low Value', value: 0, color: '#fa8c16', max: avgLifetimeValue * 0.7 },
      { name: 'Inactive', value: 0, color: '#d9d9d9', max: 0 },
    ];
    
    customers.forEach((c: any) => {
      const purchase = parseFloat(c.total_purchase);
      if (purchase > avgLifetimeValue * 1.5) segments[0].value++;
      else if (purchase >= avgLifetimeValue * 0.7) segments[1].value++;
      else if (purchase > 0) segments[2].value++;
      else segments[3].value++;
    });
    
    return segments.filter(s => s.value > 0);
  };
  
  const customerSegments = segmentCustomers();
  
  // Top 10 customers for chart
  const top10Chart = topCustomers.slice(0, 10).map((c: any) => ({
    name: c.name?.substring(0, 15) || 'Unknown',
    purchase: parseFloat(c.total_purchase) || 0,
    bills: parseInt(c.total_bills) || 0,
  }));

  return (
    <div>
      {/* Customer Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <UserOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <Statistic title="Total Customers" value={totalCustomers} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <RiseOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <Statistic title="Active Customers" value={customersWithData.length} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <TeamOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <Statistic title="VIP Customers" value={vipCustomers.length} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <DollarOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
            <Statistic title="Avg Lifetime Value" value={avgLifetimeValue} prefix="₹" precision={2} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      {/* Customer Segmentation */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Customer Segmentation" style={{ borderRadius: 12 }}>
            {customerSegments.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No customer data available" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top 10 Customers by Purchase" style={{ borderRadius: 12 }}>
            {top10Chart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10Chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="purchase" fill="#1890ff" name="Purchase (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No customer data available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Top Customers Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Customer Details" style={{ borderRadius: 12 }}>
            <Table
              dataSource={topCustomers}
              rowKey="_id"
              columns={[
                { 
                  title: 'Customer Name', 
                  dataIndex: 'name', 
                  key: 'name',
                  render: (name: string, record: any) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{name || 'Unknown'}</div>
                      {record.phone && (
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {record.phone}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  title: 'Total Purchase',
                  dataIndex: 'total_purchase',
                  key: 'total_purchase',
                  render: (val: string) => `₹${parseFloat(val || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  sorter: (a: any, b: any) => parseFloat(a.total_purchase) - parseFloat(b.total_purchase),
                },
                {
                  title: 'Bills',
                  dataIndex: 'total_bills',
                  key: 'total_bills',
                  render: (val: string) => parseInt(val || '0').toLocaleString(),
                  sorter: (a: any, b: any) => parseInt(a.total_bills) - parseInt(b.total_bills),
                },
                {
                  title: 'Avg Bill Value',
                  dataIndex: 'average_bill_value',
                  key: 'average_bill_value',
                  render: (val: string) => `₹${parseFloat(val || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  sorter: (a: any, b: any) => parseFloat(a.average_bill_value) - parseFloat(b.average_bill_value),
                },
                {
                  title: 'Outstanding',
                  dataIndex: 'outstanding_amount',
                  key: 'outstanding_amount',
                  render: (val: string) => {
                    const amount = parseFloat(val || '0');
                    return (
                      <Tag color={amount > 0 ? 'orange' : 'green'}>
                        ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Tag>
                    );
                  },
                  sorter: (a: any, b: any) => parseFloat(a.outstanding_amount) - parseFloat(b.outstanding_amount),
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_: any, record: any) => {
                    const outstanding = parseFloat(record.outstanding_amount || '0');
                    return (
                      <Tag color={outstanding === 0 ? 'success' : outstanding > 0 ? 'warning' : 'default'}>
                        {outstanding === 0 ? 'Clear' : 'Pending'}
                      </Tag>
                    );
                  },
                },
              ]}
              pagination={{ pageSize: 10 }}
              size="small"
              locale={{ emptyText: 'No customer data available' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerReport;

