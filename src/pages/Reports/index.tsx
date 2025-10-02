import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  DatePicker,
  Select,
  Button,
  Space,
  Table,
  Statistic,
  Progress,
  Tag,
  Divider,
  Tabs,
  Input,
  message,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { dynamic_request, useDynamicSelector } from '../../services/redux';
import { createApiRouteGetter } from '../../helpers/Common_functions';
import dayjs from 'dayjs';
import styles from './Reports.module.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// Sample data for charts
const salesData = [
  { name: 'Jan', sales: 4000, profit: 2400, orders: 24 },
  { name: 'Feb', sales: 3000, profit: 1398, orders: 13 },
  { name: 'Mar', sales: 2000, profit: 9800, orders: 98 },
  { name: 'Apr', sales: 2780, profit: 3908, orders: 39 },
  { name: 'May', sales: 1890, profit: 4800, orders: 48 },
  { name: 'Jun', sales: 2390, profit: 3800, orders: 38 },
];

const customerData = [
  { name: 'New Customers', value: 45, color: '#0088FE' },
  { name: 'Returning Customers', value: 35, color: '#00C49F' },
  { name: 'VIP Customers', value: 20, color: '#FFBB28' },
];

const productPerformanceData = [
  { name: 'Product A', sales: 1200, revenue: 24000 },
  { name: 'Product B', sales: 800, revenue: 16000 },
  { name: 'Product C', sales: 600, revenue: 12000 },
  { name: 'Product D', sales: 400, revenue: 8000 },
  { name: 'Product E', sales: 200, revenue: 4000 },
];

const Reports: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<string>('sales');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration - replace with actual API calls
  const salesData = [
    { name: 'Jan', sales: 4000, profit: 2400, orders: 24 },
    { name: 'Feb', sales: 3000, profit: 1398, orders: 13 },
    { name: 'Mar', sales: 2000, profit: 9800, orders: 98 },
    { name: 'Apr', sales: 2780, profit: 3908, orders: 39 },
    { name: 'May', sales: 1890, profit: 4800, orders: 48 },
    { name: 'Jun', sales: 2390, profit: 3800, orders: 38 },
  ];

  const customerData = [
    { name: 'New Customers', value: 45, color: '#0088FE' },
    { name: 'Returning Customers', value: 35, color: '#00C49F' },
    { name: 'VIP Customers', value: 20, color: '#FFBB28' },
  ];

  const fetchReportData = useCallback(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success('Report data refreshed');
    }, 1000);
  }, [dateRange, selectedBranch]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    message.success(`Exporting report as ${format.toUpperCase()}...`);
    // Implement actual export functionality
  };

  const handlePrint = () => {
    window.print();
  };

  const reportColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Invoice No',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₹${amount.toLocaleString()}`,
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Paid' ? 'green' : status === 'Pending' ? 'orange' : 'red'}>
          {status}
        </Tag>
      ),
    },
  ];

  const sampleReportData = [
    { date: '2024-01-15', invoiceNo: 'INV-001', customer: 'John Doe', amount: 2500, status: 'Paid' },
    { date: '2024-01-16', invoiceNo: 'INV-002', customer: 'Jane Smith', amount: 1800, status: 'Pending' },
    { date: '2024-01-17', invoiceNo: 'INV-003', customer: 'Bob Johnson', amount: 3200, status: 'Paid' },
    { date: '2024-01-18', invoiceNo: 'INV-004', customer: 'Alice Brown', amount: 1500, status: 'Overdue' },
  ];

  return (
    <div className={styles.container}>
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <BarChartOutlined style={{ marginRight: 8 }} />
              Reports Dashboard
            </Title>
            <Text type="secondary">Comprehensive business analytics and insights</Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchReportData}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleExport('excel')}
              >
                Export
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                Print
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Text strong>Date Range:</Text>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              style={{ width: '100%', marginTop: 4 }}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Text strong>Branch:</Text>
            <Select
              value={selectedBranch}
              onChange={setSelectedBranch}
              style={{ width: '100%', marginTop: 4 }}
            >
              <Option value="all">All Branches</Option>
              <Option value="branch1">Main Branch</Option>
              <Option value="branch2">Secondary Branch</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Text strong>Report Type:</Text>
            <Select
              value={selectedReport}
              onChange={setSelectedReport}
              style={{ width: '100%', marginTop: 4 }}
            >
              <Option value="sales">Sales Report</Option>
              <Option value="customers">Customer Report</Option>
              <Option value="products">Product Report</Option>
              <Option value="financial">Financial Report</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={fetchReportData}
              loading={loading}
              style={{ width: '100%', marginTop: 20 }}
            >
              Apply Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Total Sales"
              value={125000}
              prefix="₹"
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress percent={75} size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Total Orders"
              value={342}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={60} size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="New Customers"
              value={28}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress percent={85} size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Profit Margin"
              value={18.5}
              suffix="%"
              valueStyle={{ color: '#f5222d' }}
            />
            <Progress percent={18.5} size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="overview" style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Sales Trend" style={{ borderRadius: 12 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#1890ff"
                      fillOpacity={1}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Customer Distribution" style={{ borderRadius: 12 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card title="Product Performance" style={{ borderRadius: 12 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productPerformanceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#52c41a" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Monthly Comparison" style={{ borderRadius: 12 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#1890ff" name="Sales" />
                    <Bar dataKey="profit" fill="#52c41a" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Sales Report" key="sales">
          <Card style={{ borderRadius: 12 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={4} style={{ margin: 0 }}>Sales Transactions</Title>
              </Col>
              <Col>
                <Space>
                  <Input.Search placeholder="Search..." style={{ width: 200 }} />
                  <Button icon={<FileExcelOutlined />} onClick={() => handleExport('excel')}>
                    Excel
                  </Button>
                  <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>
                    PDF
                  </Button>
                </Space>
              </Col>
            </Row>
            <Table
              columns={reportColumns}
              dataSource={sampleReportData}
              rowKey="invoiceNo"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Customer Report" key="customers">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Customer Growth" style={{ borderRadius: 12 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#722ed1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Customer Segments" style={{ borderRadius: 12 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {customerData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Product Report" key="products">
          <Card title="Product Performance Analysis" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" fill="#1890ff" name="Units Sold" />
                <Bar yAxisId="right" dataKey="revenue" fill="#52c41a" name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabPane>

        <TabPane tab="Financial Report" key="financial">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card title="Revenue Breakdown" style={{ borderRadius: 12, textAlign: 'center' }}>
                <Statistic title="Total Revenue" value={125000} prefix="₹" />
                <Divider />
                <Statistic title="Cost of Goods" value={75000} prefix="₹" />
                <Divider />
                <Statistic title="Net Profit" value={50000} prefix="₹" />
              </Card>
            </Col>
            <Col xs={24} lg={16}>
              <Card title="Financial Trends" style={{ borderRadius: 12 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#1890ff" name="Sales" />
                    <Line type="monotone" dataKey="profit" stroke="#52c41a" name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Reports;
