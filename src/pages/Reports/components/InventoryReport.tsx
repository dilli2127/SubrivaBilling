import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Empty } from 'antd';
import {
  StockOutlined,
  DollarOutlined,
  FallOutlined,
  WarningOutlined,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { apiSlice } from '../../../services/redux/api/apiSlice';
import dayjs from 'dayjs';

const COLORS = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];

const InventoryReport: React.FC = () => {
  // Use RTK Query for data fetching
  const { data: stockReportResponse } = apiSlice.useGetStockReportQuery({});
  const { data: stockExpiryResponse } = apiSlice.useGetStockExpiryReportQuery({ days_threshold: 30 });
  
  // Extract data from responses
  const stockReportData = (stockReportResponse as any)?.result || stockReportResponse || {};
  const stockExpiryData = (stockExpiryResponse as any)?.result || stockExpiryResponse || {};
  
  const stockDetails = stockReportData?.stock_details || [];
  const stockSummary = stockReportData?.summary || {};
  const lowStockItems = stockReportData?.low_stock_items || [];
  const expiringStock = stockExpiryData?.expiring_stock || [];
  const expirySummary = stockExpiryData?.summary || {};
  const expiryBreakdown = stockExpiryData?.result?.expiry_breakdown || {};
  
  // Calculate metrics
  const totalProducts = parseInt(stockSummary.total_items) || 0;
  const stockValue = parseFloat(stockSummary.total_stock_value) || 0;
  const lowStock = parseInt(stockSummary.low_stock_count) || 0;
  const expiredCount = parseInt(expirySummary.expired_count) || 0;
  const within7Days = parseInt(expirySummary.within_7_days_count) || 0;
  
  // Group stock by category
  const categoryStockMap = new Map<string, { value: number; count: number }>();
  stockDetails.forEach((item: any) => {
    const categoryName = item.ProductItem?.CategoryItem?.category_name || 'Uncategorized';
    const qty = parseInt(item.available_quantity) || 0;
    const price = parseFloat(item.buy_price) || 0;
    const value = qty * price;
    
    if (categoryStockMap.has(categoryName)) {
      const existing = categoryStockMap.get(categoryName)!;
      categoryStockMap.set(categoryName, {
        value: existing.value + value,
        count: existing.count + 1,
      });
    } else {
      categoryStockMap.set(categoryName, { value, count: 1 });
    }
  });
  
  // Convert to array for chart
  const categoryData = Array.from(categoryStockMap.entries()).map(([name, data]) => ({
    name,
    value: data.value,
    count: data.count,
  }));
  
  // Expiry timeline data
  const expiryTimelineData = [
    { name: 'Expired', count: (expiryBreakdown.expired || []).length, color: '#ff4d4f' },
    { name: 'Within 7 days', count: (expiryBreakdown.within_7_days || []).length, color: '#ff7a45' },
    { name: 'Within 30 days', count: (expiryBreakdown.within_30_days || []).length, color: '#ffa940' },
    { name: 'Within 90 days', count: (expiryBreakdown.within_90_days || []).length, color: '#ffc53d' },
  ].filter(item => item.count > 0);

  return (
    <div>
      {/* Inventory Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <StockOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <Statistic title="Total Items" value={totalProducts} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <DollarOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <Statistic title="Stock Value" value={stockValue} prefix="₹" precision={2} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <FallOutlined style={{ fontSize: 32, color: '#ff4d4f', marginBottom: 8 }} />
            <Statistic title="Low Stock Items" value={lowStock} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <WarningOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
            <Statistic title="Expiring Soon (7d)" value={within7Days} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      {/* Stock Distribution & Expiry */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Category-wise Stock Value" style={{ borderRadius: 12 }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No stock data available" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Stock Expiry Timeline" style={{ borderRadius: 12 }}>
            {expiryTimelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expiryTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#ff7a45" name="Items Count">
                    {expiryTimelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No expiry data available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Low Stock Items Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<><FallOutlined style={{ color: '#ff4d4f' }} /> Low Stock Items</>} style={{ borderRadius: 12 }}>
            <Table
              dataSource={lowStockItems}
              rowKey={(record: any) => `${record.product}-${record.variant}`}
              columns={[
                { 
                  title: 'Product', 
                  dataIndex: 'product', 
                  key: 'product',
                  render: (product: string, record: any) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{product || 'Unknown'}</div>
                      {record.variant && (
                        <div style={{ fontSize: '12px', color: '#888' }}>{record.variant}</div>
                      )}
                    </div>
                  )
                },
                {
                  title: 'Available',
                  dataIndex: 'available_quantity',
                  key: 'available_quantity',
                  render: (qty: number, record: any) => (
                    <Tag color="red">
                      {qty} {record.available_loose_quantity > 0 && `+ ${record.available_loose_quantity} loose`}
                    </Tag>
                  ),
                },
              ]}
              pagination={{ pageSize: 5 }}
              size="small"
              locale={{ emptyText: 'No low stock items' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={<><WarningOutlined style={{ color: '#fa8c16' }} /> Expiring Soon</>} style={{ borderRadius: 12 }}>
            <Table
              dataSource={expiringStock.slice(0, 10)}
              rowKey="_id"
              columns={[
                { 
                  title: 'Product', 
                  key: 'product',
                  render: (record: any) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{record.ProductItem?.name || 'Unknown'}</div>
                      {record.ProductItem?.VariantItem && (
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {record.ProductItem.VariantItem.variant_name}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  title: 'Expiry Date',
                  dataIndex: 'expiry_date',
                  key: 'expiry_date',
                  render: (date: string) => {
                    const daysToExpiry = dayjs(date).diff(dayjs(), 'day');
                    const color = daysToExpiry < 0 ? 'red' : daysToExpiry <= 7 ? 'orange' : 'yellow';
                    return (
                      <Tag color={color}>
                        {dayjs(date).format('DD MMM YYYY')}
                        {daysToExpiry < 0 && ' (Expired)'}
                        {daysToExpiry >= 0 && ` (${daysToExpiry}d)`}
                      </Tag>
                    );
                  },
                },
                {
                  title: 'Qty',
                  dataIndex: 'available_quantity',
                  key: 'available_quantity',
                },
              ]}
              pagination={{ pageSize: 5 }}
              size="small"
              locale={{ emptyText: 'No expiring items' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Category Analysis Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Category-wise Stock Analysis" style={{ borderRadius: 12 }}>
            <Table
              dataSource={categoryData}
              rowKey="name"
              columns={[
                { title: 'Category', dataIndex: 'name', key: 'name' },
                {
                  title: 'Items Count',
                  dataIndex: 'count',
                  key: 'count',
                  sorter: (a: any, b: any) => a.count - b.count,
                },
                {
                  title: 'Stock Value',
                  dataIndex: 'value',
                  key: 'value',
                  render: (val: number) => `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  sorter: (a: any, b: any) => a.value - b.value,
                },
                {
                  title: 'Percentage',
                  key: 'percentage',
                  render: (_: any, record: any) => {
                    const percent = (record.value / stockValue) * 100;
                    return (
                      <Progress
                        percent={Math.round(percent)}
                        size="small"
                        status={percent > 20 ? 'success' : 'normal'}
                      />
                    );
                  },
                },
              ]}
              pagination={false}
              size="small"
              locale={{ emptyText: 'No category data available' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InventoryReport;

