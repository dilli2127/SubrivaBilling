import React from 'react';
import { Card, Row, Col, Typography, Statistic, Empty } from 'antd';
import {
  DollarOutlined,
  FundOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts';
import { useSpecialApiFetchers } from '../../../services/api/specialApiFetchers';
import { useDynamicSelector } from '../../../services/redux/selector';

const { Text } = Typography;
const COLORS = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];

const ComprehensiveReport: React.FC = () => {
  const { Reports } = useSpecialApiFetchers();
  
  // Get data from Redux store
  const salesReportData = useDynamicSelector(Reports.getIdentifier('GetSalesReport'));
  const profitLossData = useDynamicSelector(Reports.getIdentifier('GetProfitLossReport'));
  const customerSalesData = useDynamicSelector(Reports.getIdentifier('GetCustomerSalesReport'));
  const stockReportData = useDynamicSelector(Reports.getIdentifier('GetStockReport'));
  const paymentCollectionData = useDynamicSelector(Reports.getIdentifier('GetPaymentCollectionReport'));
  const productSalesData = useDynamicSelector(Reports.getIdentifier('GetProductSalesReport'));
  
  // Extract data
  const salesSummary = salesReportData?.result?.summary || {};
  const profitLoss = profitLossData?.result || {};
  const customers = customerSalesData?.result?.customers || [];
  const stockSummary = stockReportData?.result?.summary || {};
  const collectionSummary = paymentCollectionData?.result?.summary || {};
  const productSales = productSalesData?.result?.products || [];
  const salesData = salesReportData?.result?.sales || [];
  
  // Calculate metrics
  const totalRevenue = parseFloat(salesSummary.total_revenue) || 0;
  const netProfit = parseFloat(profitLoss.profit?.net_profit) || 0;
  const totalBills = parseInt(salesSummary.total_bills) || 0;
  const totalCustomers = customers.length;
  const avgBillValue = parseFloat(salesSummary.average_bill_value) || 0;
  const profitMargin = parseFloat(profitLoss.profit?.profit_margin_percentage) || 0;
  const stockValue = parseFloat(stockSummary.total_stock_value) || 0;
  const totalCollected = parseFloat(collectionSummary.total_collected) || 0;
  
  // Prepare customer segments
  const activeCustomers = customers.filter((c: any) => parseFloat(c.total_purchase) > 0);
  const avgLifetimeValue = activeCustomers.length > 0 
    ? activeCustomers.reduce((sum: number, c: any) => sum + parseFloat(c.total_purchase), 0) / activeCustomers.length 
    : 0;
  
  const customerSegments = [
    { 
      name: 'High Value', 
      value: activeCustomers.filter((c: any) => parseFloat(c.total_purchase) > avgLifetimeValue * 1.5).length, 
      color: '#52c41a',
      percentage: activeCustomers.length > 0 ? ((activeCustomers.filter((c: any) => parseFloat(c.total_purchase) > avgLifetimeValue * 1.5).length / activeCustomers.length) * 100).toFixed(1) : 0
    },
    { 
      name: 'Medium Value', 
      value: activeCustomers.filter((c: any) => {
        const purchase = parseFloat(c.total_purchase);
        return purchase >= avgLifetimeValue * 0.7 && purchase <= avgLifetimeValue * 1.5;
      }).length,
      color: '#1890ff',
      percentage: activeCustomers.length > 0 ? ((activeCustomers.filter((c: any) => {
        const purchase = parseFloat(c.total_purchase);
        return purchase >= avgLifetimeValue * 0.7 && purchase <= avgLifetimeValue * 1.5;
      }).length / activeCustomers.length) * 100).toFixed(1) : 0
    },
    { 
      name: 'Low Value', 
      value: activeCustomers.filter((c: any) => parseFloat(c.total_purchase) < avgLifetimeValue * 0.7 && parseFloat(c.total_purchase) > 0).length,
      color: '#fa8c16',
      percentage: activeCustomers.length > 0 ? ((activeCustomers.filter((c: any) => parseFloat(c.total_purchase) < avgLifetimeValue * 0.7 && parseFloat(c.total_purchase) > 0).length / activeCustomers.length) * 100).toFixed(1) : 0
    },
  ].filter(s => s.value > 0);
  
  // Top products for chart
  const topProductsChart = productSales.slice(0, 6).map((product: any) => ({
    name: (product.name || 'Unknown').substring(0, 20),
    sales: parseFloat(product.total_revenue) || 0,
    quantity: parseInt(product.total_quantity_sold) || 0,
  }));
  
  // Payment method breakdown
  const paymentMethods = (collectionSummary.payment_mode_breakdown || []).map((item: any) => ({
    method: item.payment_mode || 'Cash',
    amount: parseFloat(item.total_amount) || 0,
    percentage: totalCollected > 0 ? ((parseFloat(item.total_amount) / totalCollected) * 100).toFixed(1) : 0,
  }));
  
  // Sales trend data (if grouped data available)
  const trendData = Array.isArray(salesData) && salesData.length > 0 && salesData[0]?.period
    ? salesData.map((item: any) => ({
        period: item.period,
        sales: parseFloat(item.total_sales) || 0,
        transactions: parseInt(item.total_transactions) || 0,
      }))
    : [];

  return (
    <div>
      {/* Key Performance Indicators */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
            <DollarOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Total Revenue</Text>}
              value={totalRevenue}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {totalBills} Bills • Avg: ₹{avgBillValue.toFixed(2)}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' }}>
            <FundOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Net Profit</Text>}
              value={netProfit}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              Margin: {profitMargin}%
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' }}>
            <ShoppingCartOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Stock Value</Text>}
              value={stockValue}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {parseInt(stockSummary.total_items) || 0} Items in stock
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff' }}>
            <UserOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Customers</Text>}
              value={totalCustomers}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {activeCustomers.length} Active customers
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Sales Trend & Customer Segments */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title={<><LineChartOutlined /> Sales Trend</>} style={{ borderRadius: 12 }}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="transactions" fill="#8884d8" name="Transactions" />
                  <Line type="monotone" dataKey="sales" stroke="#82ca9d" strokeWidth={3} name="Sales (₹)" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Use group_by filter (daily/monthly/yearly) to see trends" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><PieChartOutlined /> Customer Segments</>} style={{ borderRadius: 12 }}>
            {customerSegments.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
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
      </Row>

      {/* Product Performance & Payment Methods */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<><BarChartOutlined /> Top Products</>} style={{ borderRadius: 12 }}>
            {topProductsChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No product data available" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Payment Method Distribution" style={{ borderRadius: 12 }}>
            {paymentMethods.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ method, percentage }) => `${method}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {paymentMethods.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No payment data available" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ComprehensiveReport;
