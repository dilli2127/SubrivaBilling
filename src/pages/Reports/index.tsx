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
  Tabs,
  message,
  Modal,
  Radio,
  Checkbox,
  Form,
  Tooltip,
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
  FundOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  StockOutlined,
  TeamOutlined,
  SwapOutlined,
  TrophyOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  SettingOutlined,
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
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import dayjs from 'dayjs';
import styles from './Reports.module.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#ffc658', '#8dd1e1'];

// Sample data for charts - will be replaced with API data
const mockSalesData = [
  { month: 'Jan', sales: 45000, profit: 12400, cost: 32600, orders: 124 },
  { month: 'Feb', sales: 52000, profit: 15398, cost: 36602, orders: 143 },
  { month: 'Mar', sales: 48000, profit: 13800, cost: 34200, orders: 138 },
  { month: 'Apr', sales: 61000, profit: 17908, cost: 43092, orders: 169 },
  { month: 'May', sales: 55000, profit: 16800, cost: 38200, orders: 158 },
  { month: 'Jun', sales: 67000, profit: 20800, cost: 46200, orders: 189 },
];

const mockCustomerSegments = [
  { name: 'New Customers', value: 145, color: '#0088FE', percentage: 28 },
  { name: 'Regular Customers', value: 235, color: '#00C49F', percentage: 46 },
  { name: 'VIP Customers', value: 85, color: '#FFBB28', percentage: 17 },
  { name: 'Inactive', value: 45, color: '#FF8042', percentage: 9 },
];

const mockProductPerformance = [
  { name: 'Electronics', sales: 120000, profit: 35000, margin: 29.2 },
  { name: 'Clothing', sales: 95000, profit: 28500, margin: 30.0 },
  { name: 'Food Items', sales: 78000, profit: 15600, margin: 20.0 },
  { name: 'Furniture', sales: 56000, profit: 16800, margin: 30.0 },
  { name: 'Accessories', sales: 42000, profit: 12600, margin: 30.0 },
];

const mockPaymentMethods = [
  { method: 'Cash', amount: 125000, transactions: 342, percentage: 35 },
  { method: 'Card', amount: 178000, transactions: 456, percentage: 50 },
  { method: 'UPI', amount: 42000, transactions: 189, percentage: 12 },
  { method: 'Credit', amount: 11000, transactions: 23, percentage: 3 },
];

const mockTopCustomers = [
  { name: 'Rajesh Kumar', totalPurchase: 125000, orders: 45, outstanding: 5000 },
  { name: 'Priya Sharma', totalPurchase: 98000, orders: 38, outstanding: 0 },
  { name: 'Amit Patel', totalPurchase: 87000, orders: 32, outstanding: 8000 },
  { name: 'Sneha Reddy', totalPurchase: 76000, orders: 28, outstanding: 2000 },
  { name: 'Vikram Singh', totalPurchase: 65000, orders: 24, outstanding: 0 },
];

const mockStaffPerformance = [
  { name: 'Rahul Verma', sales: 245000, orders: 89, conversion: 85, target: 250000 },
  { name: 'Anita Desai', sales: 198000, orders: 76, conversion: 78, target: 200000 },
  { name: 'Karan Mehta', sales: 176000, orders: 65, conversion: 72, target: 180000 },
  { name: 'Pooja Nair', sales: 154000, orders: 58, conversion: 68, target: 150000 },
];

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<string>('comprehensive');
  const [loading, setLoading] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [exportOptions, setExportOptions] = useState<string[]>(['summary', 'charts', 'tables']);
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();

  const fetchReportData = useCallback(() => {
    setLoading(true);
    // Simulate API call - replace with actual API integration
    setTimeout(() => {
      setLoading(false);
      message.success('Report data refreshed successfully');
    }, 1000);
  }, []);

  const handleExport = () => {
    message.success(`Exporting report as ${exportFormat.toUpperCase()}...`);
    setExportModalVisible(false);
    // Implement actual export functionality
  };

  const handlePrint = () => {
    message.info('Preparing report for printing...');
    window.print();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch(e.key) {
          case '1': case '2': case '3': case '4': case '5': case '6': case '7':
            e.preventDefault();
            setActiveTab(e.key);
            break;
          case 'r': case 'R':
            e.preventDefault();
            fetchReportData();
            break;
          case 'e': case 'E':
            e.preventDefault();
            setExportModalVisible(true);
            break;
          case 'p': case 'P':
            e.preventDefault();
            handlePrint();
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [fetchReportData]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Render functions for each tab
  const renderComprehensiveReport = () => (
    <div>
      {/* Key Performance Indicators */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
            <DollarOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Total Revenue</Text>}
              value={328000}
              prefix="₹"
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              <RiseOutlined /> +18.5% vs last period
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' }}>
            <FundOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Net Profit</Text>}
              value={97106}
              prefix="₹"
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              Margin: 29.6%
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' }}>
            <ShoppingCartOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Total Orders</Text>}
              value={921}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              Avg: ₹356 per order
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff' }}>
            <UserOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Statistic
              title={<Text style={{ color: '#fff' }}>Active Customers</Text>}
              value={510}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#fff', fontSize: 12 }}>
              <RiseOutlined /> +45 new this month
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Sales & Profit Trend */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title={<><LineChartOutlined /> Sales & Profit Trend</>} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales (₹)" />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={3} name="Profit (₹)" />
                <Line type="monotone" dataKey="cost" stroke="#ff8042" strokeWidth={2} name="Cost (₹)" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><PieChartOutlined /> Customer Segments</>} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockCustomerSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockCustomerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Product Performance & Payment Methods */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<><BarChartOutlined /> Top Product Categories</>} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockProductPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales (₹)" />
                <Bar dataKey="profit" fill="#82ca9d" name="Profit (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Payment Method Distribution" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockPaymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percentage }) => `${method}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {mockPaymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderFinancialReport = () => (
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

  const renderSalesAnalysisReport = () => (
    <div>
      {/* Sales Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Total Sales" value={328000} prefix="₹" valueStyle={{ color: '#1890ff' }} />
            <Progress percent={82} size="small" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Avg Order Value" value={356} prefix="₹" valueStyle={{ color: '#52c41a' }} />
            <Progress percent={68} size="small" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Conversion Rate" value={24.5} suffix="%" precision={1} valueStyle={{ color: '#722ed1' }} />
            <Progress percent={74} size="small" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic title="Repeat Customer Rate" value={46} suffix="%" valueStyle={{ color: '#fa8c16' }} />
            <Progress percent={46} size="small" />
          </Card>
        </Col>
      </Row>

      {/* Sales by Category & Orders */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Sales by Category" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockProductPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sales" fill="#1890ff" name="Sales (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Monthly Orders Trend" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockSalesData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="orders" stroke="#8884d8" fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top Customers */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title={<><TrophyOutlined /> Top 5 Customers</>} style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockTopCustomers}
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
                { title: 'Customer Name', dataIndex: 'name', key: 'name' },
                {
                  title: 'Total Purchase',
                  dataIndex: 'totalPurchase',
                  key: 'totalPurchase',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                  sorter: (a: any, b: any) => a.totalPurchase - b.totalPurchase,
                },
                {
                  title: 'Orders',
                  dataIndex: 'orders',
                  key: 'orders',
                  sorter: (a: any, b: any) => a.orders - b.orders,
                },
                {
                  title: 'Outstanding',
                  dataIndex: 'outstanding',
                  key: 'outstanding',
                  render: (val: number) => (
                    <Text style={{ color: val > 0 ? '#fa8c16' : '#52c41a' }}>
                      ₹{val.toLocaleString()}
                    </Text>
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

  const renderCustomerAnalyticsReport = () => (
    <div>
      {/* Customer Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <UserOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <Statistic title="Total Customers" value={510} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <RiseOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <Statistic title="New This Month" value={45} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <TeamOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <Statistic title="VIP Customers" value={85} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <DollarOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
            <Statistic title="Avg Lifetime Value" value={643} prefix="₹" valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      {/* Customer Segmentation */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Customer Segmentation" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockCustomerSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockCustomerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Customer Growth Trend" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} name="New Customers" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top Customers Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Customer Details" style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockTopCustomers}
              columns={[
                { title: 'Customer Name', dataIndex: 'name', key: 'name' },
                {
                  title: 'Total Purchase',
                  dataIndex: 'totalPurchase',
                  key: 'totalPurchase',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                  sorter: (a: any, b: any) => a.totalPurchase - b.totalPurchase,
                },
                {
                  title: 'Orders',
                  dataIndex: 'orders',
                  key: 'orders',
                  sorter: (a: any, b: any) => a.orders - b.orders,
                },
                {
                  title: 'Avg Order Value',
                  key: 'avgOrder',
                  render: (_: any, record: any) => `₹${Math.round(record.totalPurchase / record.orders).toLocaleString()}`,
                },
                {
                  title: 'Outstanding',
                  dataIndex: 'outstanding',
                  key: 'outstanding',
                  render: (val: number) => (
                    <Tag color={val > 0 ? 'orange' : 'green'}>
                      ₹{val.toLocaleString()}
                    </Tag>
                  ),
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_: any, record: any) => (
                    <Tag color={record.outstanding === 0 ? 'success' : 'warning'}>
                      {record.outstanding === 0 ? 'Clear' : 'Pending'}
                    </Tag>
                  ),
                },
              ]}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderInventoryReport = () => (
    <div>
      {/* Inventory Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <StockOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <Statistic title="Total Products" value={1245} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <DollarOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <Statistic title="Stock Value" value={850000} prefix="₹" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <FallOutlined style={{ fontSize: 32, color: '#ff4d4f', marginBottom: 8 }} />
            <Statistic title="Low Stock Items" value={42} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <SwapOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
            <Statistic title="Out of Stock" value={18} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      {/* Stock Movement */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Stock Movement (Last 6 Months)" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#1890ff" strokeWidth={2} name="Sales Units" />
                <Line type="monotone" dataKey="orders" stroke="#52c41a" strokeWidth={2} name="Purchase Units" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Category-wise Stock Distribution" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockProductPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sales"
                >
                  {mockProductPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Stock Status Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Category-wise Stock Analysis" style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockProductPerformance}
              columns={[
                { title: 'Category', dataIndex: 'name', key: 'name' },
                {
                  title: 'Sales',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                },
                {
                  title: 'Profit',
                  dataIndex: 'profit',
                  key: 'profit',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                },
                {
                  title: 'Profit Margin',
                  dataIndex: 'margin',
                  key: 'margin',
                  render: (val: number) => (
                    <Tag color={val > 25 ? 'green' : val > 15 ? 'orange' : 'red'}>
                      {val.toFixed(1)}%
                    </Tag>
                  ),
                },
                {
                  title: 'Performance',
                  key: 'performance',
                  render: (_: any, record: any) => (
                    <Progress
                      percent={Math.round((record.sales / 150000) * 100)}
                      size="small"
                      status={record.margin > 25 ? 'success' : 'normal'}
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
    </div>
  );

  const renderStaffPerformanceReport = () => (
    <div>
      {/* Staff Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <TeamOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <Statistic title="Total Staff" value={24} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <TrophyOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <Statistic title="Top Performer Sales" value={245000} prefix="₹" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <RiseOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <Statistic title="Avg Conversion Rate" value={75.8} suffix="%" valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <BarChartOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
            <Statistic title="Target Achievement" value={91} suffix="%" valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      {/* Performance Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Staff Sales Performance" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockStaffPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sales" fill="#1890ff" name="Sales (₹)" />
                <Bar dataKey="target" fill="#d3d3d3" name="Target (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Conversion Rate Comparison" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={mockStaffPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Conversion %" dataKey="conversion" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Staff Performance Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Detailed Staff Performance" style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockStaffPerformance}
              columns={[
                { title: 'Name', dataIndex: 'name', key: 'name' },
                {
                  title: 'Sales',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                  sorter: (a: any, b: any) => a.sales - b.sales,
                },
                {
                  title: 'Target',
                  dataIndex: 'target',
                  key: 'target',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                },
                {
                  title: 'Achievement',
                  key: 'achievement',
                  render: (_: any, record: any) => {
                    const achievement = (record.sales / record.target) * 100;
                    return (
                      <Tag color={achievement >= 100 ? 'success' : achievement >= 80 ? 'processing' : 'warning'}>
                        {achievement.toFixed(1)}%
                      </Tag>
                    );
                  },
                  sorter: (a: any, b: any) => (a.sales / a.target) - (b.sales / b.target),
                },
                {
                  title: 'Orders',
                  dataIndex: 'orders',
                  key: 'orders',
                  sorter: (a: any, b: any) => a.orders - b.orders,
                },
                {
                  title: 'Conversion Rate',
                  dataIndex: 'conversion',
                  key: 'conversion',
                  render: (val: number) => (
                    <span>
                      {val}%
                      <Progress percent={val} size="small" style={{ marginTop: 4 }} />
                    </span>
                  ),
                  sorter: (a: any, b: any) => a.conversion - b.conversion,
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_: any, record: any) => {
                    const achievement = (record.sales / record.target) * 100;
                    return (
                      <Tag color={achievement >= 100 ? 'green' : achievement >= 90 ? 'blue' : achievement >= 75 ? 'orange' : 'red'}>
                        {achievement >= 100 ? 'Excellent' : achievement >= 90 ? 'Good' : achievement >= 75 ? 'Average' : 'Below Avg'}
                      </Tag>
                    );
                  },
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

  const renderPaymentAnalysisReport = () => (
    <div>
      {/* Payment Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#f6ffed' }}>
            <Statistic
              title="Total Collected"
              value={356000}
              prefix="₹"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#fff7e6' }}>
            <Statistic
              title="Pending"
              value={28000}
              prefix="₹"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#fff1f0' }}>
            <Statistic
              title="Overdue"
              value={11000}
              prefix="₹"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#e6f7ff' }}>
            <Statistic
              title="Collection Rate"
              value={92.7}
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockPaymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ method, percentage }) => `${method}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {mockPaymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Payment Method Breakdown" style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockPaymentMethods}
              columns={[
                { title: 'Method', dataIndex: 'method', key: 'method' },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: (val: number) => `₹${val.toLocaleString()}`,
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
                      <Progress percent={val} size="small" style={{ marginTop: 4 }} />
                    </span>
                  ),
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Outstanding Receivables */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Outstanding Receivables by Customer" style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockTopCustomers.filter(c => c.outstanding > 0)}
              columns={[
                { title: 'Customer Name', dataIndex: 'name', key: 'name' },
                {
                  title: 'Total Purchase',
                  dataIndex: 'totalPurchase',
                  key: 'totalPurchase',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                },
                {
                  title: 'Outstanding',
                  dataIndex: 'outstanding',
                  key: 'outstanding',
                  render: (val: number) => (
                    <Text strong style={{ color: '#ff4d4f' }}>
                      ₹{val.toLocaleString()}
                    </Text>
                  ),
                  sorter: (a: any, b: any) => a.outstanding - b.outstanding,
                },
                {
                  title: 'Days Overdue',
                  key: 'daysOverdue',
                  render: () => Math.floor(Math.random() * 30) + 1,
                  sorter: (a: any, b: any) => a.outstanding - b.outstanding,
                },
                {
                  title: 'Priority',
                  key: 'priority',
                  render: (_: any, record: any) => (
                    <Tag color={record.outstanding > 5000 ? 'red' : 'orange'}>
                      {record.outstanding > 5000 ? 'High' : 'Medium'}
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

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <BarChartOutlined style={{ marginRight: 8 }} />
              Advanced Business Reports
            </Title>
            <Text type="secondary">Comprehensive analytics & insights with advanced reporting</Text>
          </Col>
          <Col>
            <Space wrap>
              <Tooltip title="Refresh Data (Ctrl+R)">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchReportData}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Tooltip>
              <Tooltip title="Export Report (Ctrl+E)">
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => setExportModalVisible(true)}
                  type="primary"
                >
                  Export
                </Button>
              </Tooltip>
              <Tooltip title="Print Report (Ctrl+P)">
                <Button
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                >
                  Print
                </Button>
              </Tooltip>
              <Tooltip title="Settings">
                <Button
                  icon={<SettingOutlined />}
                  type="dashed"
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Text strong><CalendarOutlined /> Date Range:</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                style={{ width: '100%' }}
              />
            </Space>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Text strong>Branch:</Text>
              <Select
                value={selectedBranch}
                onChange={setSelectedBranch}
                style={{ width: '100%' }}
              >
                <Option value="all">All Branches</Option>
                <Option value="branch1">Main Branch</Option>
                <Option value="branch2">Branch A</Option>
                <Option value="branch3">Branch B</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Text strong>Report Type:</Text>
              <Select
                value={selectedReport}
                onChange={setSelectedReport}
                style={{ width: '100%' }}
              >
                <Option value="comprehensive">Comprehensive Report</Option>
                <Option value="financial">Financial Analysis</Option>
                <Option value="sales">Sales Analytics</Option>
                <Option value="customer">Customer Analytics</Option>
                <Option value="inventory">Inventory Report</Option>
                <Option value="staff">Staff Performance</Option>
                <Option value="payment">Payment Analysis</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={fetchReportData}
              loading={loading}
              style={{ width: '100%', marginTop: 22 }}
              size="large"
            >
              Apply Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Report Content Tabs */}
      <Tabs 
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card" 
        size="large"
        style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        items={[
          {
            key: '1',
            label: (
              <Tooltip title="Comprehensive Overview (Ctrl+1)">
                <span><BarChartOutlined /> Comprehensive</span>
              </Tooltip>
            ),
            children: renderComprehensiveReport(),
          },
          {
            key: '2',
            label: (
              <Tooltip title="Financial Analysis (Ctrl+2)">
                <span><FundOutlined /> Financial</span>
              </Tooltip>
            ),
            children: renderFinancialReport(),
          },
          {
            key: '3',
            label: (
              <Tooltip title="Sales Analytics (Ctrl+3)">
                <span><ShoppingCartOutlined /> Sales</span>
              </Tooltip>
            ),
            children: renderSalesAnalysisReport(),
          },
          {
            key: '4',
            label: (
              <Tooltip title="Customer Analytics (Ctrl+4)">
                <span><UserOutlined /> Customers</span>
              </Tooltip>
            ),
            children: renderCustomerAnalyticsReport(),
          },
          {
            key: '5',
            label: (
              <Tooltip title="Inventory Report (Ctrl+5)">
                <span><StockOutlined /> Inventory</span>
              </Tooltip>
            ),
            children: renderInventoryReport(),
          },
          {
            key: '6',
            label: (
              <Tooltip title="Staff Performance (Ctrl+6)">
                <span><TeamOutlined /> Staff</span>
              </Tooltip>
            ),
            children: renderStaffPerformanceReport(),
          },
          {
            key: '7',
            label: (
              <Tooltip title="Payment Analysis (Ctrl+7)">
                <span><DollarOutlined /> Payments</span>
              </Tooltip>
            ),
            children: renderPaymentAnalysisReport(),
          },
        ]}
      />

      {/* Export Modal */}
      <Modal
        title={<><DownloadOutlined /> Export Report</>}
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onOk={handleExport}
        okText="Export"
        cancelText="Cancel"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Export Format">
            <Radio.Group 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="pdf"><FilePdfOutlined /> PDF</Radio.Button>
              <Radio.Button value="excel"><FileExcelOutlined /> Excel</Radio.Button>
              <Radio.Button value="csv">CSV</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Include in Export">
            <Checkbox.Group 
              value={exportOptions}
              onChange={(values) => setExportOptions(values as string[])}
              style={{ width: '100%' }}
            >
              <Row>
                <Col span={24}><Checkbox value="summary">Summary Statistics</Checkbox></Col>
                <Col span={24}><Checkbox value="charts">Charts & Graphs</Checkbox></Col>
                <Col span={24}><Checkbox value="tables">Detailed Tables</Checkbox></Col>
                <Col span={24}><Checkbox value="trends">Trend Analysis</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="Date Range">
            <RangePicker style={{ width: '100%' }} value={dateRange} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Reports;
