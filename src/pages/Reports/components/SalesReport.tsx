import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Empty } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import { useReportDataContext } from '../context/ReportDataContext';

const SalesReport: React.FC = () => {
  // Get data from context instead of making API calls
  const {
    salesReportData: salesReportDataContext,
    productSalesData: productSalesDataContext,
    topProductsData: topProductsDataContext,
  } = useReportDataContext();
  
  // Extract data from context
  const salesReportData = salesReportDataContext?.result || {};
  const productSalesData = productSalesDataContext?.result || {};
  const topProductsData = topProductsDataContext?.result || {};
  
  const salesSummary = salesReportData?.summary || {};
  const productSales = productSalesData?.products || [];
  const topProducts = topProductsData?.top_products || [];
  const salesData = salesReportData?.sales || [];
  
  // Calculate average bill value and prepare chart data
  const avgBillValue = salesSummary.average_bill_value || 0;
  const totalRevenue = salesSummary.total_revenue || 0;
  const totalBills = salesSummary.total_bills || 0;
  const totalCollected = salesSummary.total_collected || 0;
  const totalOutstanding = salesSummary.total_outstanding || 0;
  
  // Calculate percentages for progress bars
  const revenuePercent = totalRevenue > 0 ? Math.min((totalRevenue / (totalRevenue * 1.2)) * 100, 100) : 0;
  const collectionPercent = totalRevenue > 0 ? Math.min((totalCollected / totalRevenue) * 100, 100) : 0;
  const outstandingPercent = totalRevenue > 0 ? Math.min((totalOutstanding / totalRevenue) * 100, 100) : 0;
  
  // Prepare product category data for chart
  const categoryChartData = productSales.slice(0, 10).map((product: any) => ({
    name: product.name || 'Unknown',
    sales: parseFloat(product.total_revenue) || 0,
    quantity: parseInt(product.total_quantity_sold) || 0,
  }));
  
  // Prepare sales trend data (if grouped data available)
  const trendData = Array.isArray(salesData) && salesData.length > 0 && salesData[0]?.period
    ? salesData.map((item: any) => ({
        period: item.period,
        revenue: parseFloat(item.total_sales) || 0,
        transactions: parseInt(item.total_transactions) || 0,
      }))
    : [];

  return (
    <div>
      {/* Sales Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic 
              title="Total Revenue" 
              value={totalRevenue} 
              prefix="₹" 
              precision={2}
              valueStyle={{ color: '#1890ff' }} 
            />
            <Progress percent={Math.round(revenuePercent)} size="small" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic 
              title="Avg Bill Value" 
              value={avgBillValue} 
              prefix="₹" 
              precision={2}
              valueStyle={{ color: '#52c41a' }} 
            />
            <Progress percent={Math.round(revenuePercent * 0.8)} size="small" strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic 
              title="Total Collected" 
              value={totalCollected} 
              prefix="₹" 
              precision={2}
              valueStyle={{ color: '#722ed1' }} 
            />
            <Progress percent={Math.round(collectionPercent)} size="small" strokeColor="#722ed1" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic 
              title="Outstanding" 
              value={totalOutstanding} 
              prefix="₹" 
              precision={2}
              valueStyle={{ color: '#fa8c16' }} 
            />
            <Progress percent={Math.round(outstandingPercent)} size="small" strokeColor="#fa8c16" />
          </Card>
        </Col>
      </Row>

      {/* Sales by Product & Trend */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Top Products by Revenue" style={{ borderRadius: 12 }}>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#1890ff" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No product sales data available" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sales Trend" style={{ borderRadius: 12 }}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#1890ff" name="Revenue (₹)" />
                  <Line type="monotone" dataKey="transactions" stroke="#52c41a" name="Transactions" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No trend data available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Top Products Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title={<><TrophyOutlined /> Top 10 Products</>} style={{ borderRadius: 12 }}>
            <Table
              dataSource={topProducts}
              rowKey="_id"
              columns={[
                {
                  title: 'Rank',
                  key: 'rank',
                  width: 70,
                  render: (_: any, __: any, index: number) => (
                    <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'default'}>
                      #{index + 1}
                    </Tag>
                  ),
                },
                { 
                  title: 'Product Name', 
                  dataIndex: 'name', 
                  key: 'name',
                  render: (name: string, record: any) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{name}</div>
                      {record.VariantItem && (
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {record.VariantItem.variant_name}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  title: 'Total Revenue',
                  dataIndex: 'total_revenue',
                  key: 'total_revenue',
                  render: (val: string) => `₹${parseFloat(val || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  sorter: (a: any, b: any) => parseFloat(a.total_revenue) - parseFloat(b.total_revenue),
                },
                {
                  title: 'Quantity Sold',
                  dataIndex: 'total_quantity_sold',
                  key: 'total_quantity_sold',
                  render: (val: string) => parseInt(val || '0').toLocaleString(),
                  sorter: (a: any, b: any) => parseInt(a.total_quantity_sold) - parseInt(b.total_quantity_sold),
                },
                {
                  title: 'Orders',
                  dataIndex: 'total_orders',
                  key: 'total_orders',
                  render: (val: string) => parseInt(val || '0').toLocaleString(),
                  sorter: (a: any, b: any) => parseInt(a.total_orders) - parseInt(b.total_orders),
                },
              ]}
              pagination={{ pageSize: 10 }}
              size="small"
              locale={{ emptyText: 'No product data available' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SalesReport;

