import React, { useState, useCallback } from 'react';
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
  Input,
  message,
  Tag,
  Progress,
  Avatar,
} from 'antd';
import {
  UserOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  FilterOutlined,
  StarOutlined,
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
} from 'recharts';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import dayjs from 'dayjs';
import styles from './Reports.module.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CustomerReport: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Sample data for demonstration
  const customerGrowthData = [
    { name: 'Jan', newCustomers: 45, returningCustomers: 120, totalOrders: 165 },
    { name: 'Feb', newCustomers: 52, returningCustomers: 135, totalOrders: 187 },
    { name: 'Mar', newCustomers: 38, returningCustomers: 142, totalOrders: 180 },
    { name: 'Apr', newCustomers: 61, returningCustomers: 158, totalOrders: 219 },
    { name: 'May', newCustomers: 48, returningCustomers: 165, totalOrders: 213 },
    { name: 'Jun', newCustomers: 55, returningCustomers: 172, totalOrders: 227 },
  ];

  const customerSegmentData = [
    { name: 'New Customers', value: 45, color: '#0088FE' },
    { name: 'Returning Customers', value: 35, color: '#00C49F' },
    { name: 'VIP Customers', value: 20, color: '#FFBB28' },
  ];

  const customerLifetimeValueData = [
    { name: 'Bronze', customers: 120, avgValue: 2500, totalValue: 300000 },
    { name: 'Silver', customers: 80, avgValue: 5000, totalValue: 400000 },
    { name: 'Gold', customers: 40, avgValue: 10000, totalValue: 400000 },
    { name: 'Platinum', customers: 15, avgValue: 20000, totalValue: 300000 },
  ];

  const sampleCustomerData = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      totalOrders: 15,
      totalSpent: 25000,
      lastOrder: '2024-01-15',
      segment: 'Gold',
      status: 'Active',
      joinDate: '2023-06-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      totalOrders: 8,
      totalSpent: 12000,
      lastOrder: '2024-01-10',
      segment: 'Silver',
      status: 'Active',
      joinDate: '2023-08-20',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+1234567892',
      totalOrders: 25,
      totalSpent: 45000,
      lastOrder: '2024-01-18',
      segment: 'Platinum',
      status: 'Active',
      joinDate: '2023-03-10',
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice@example.com',
      phone: '+1234567893',
      totalOrders: 3,
      totalSpent: 3500,
      lastOrder: '2023-12-20',
      segment: 'Bronze',
      status: 'Inactive',
      joinDate: '2023-11-15',
    },
  ];

  const customerColumns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Total Orders',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      sorter: (a: any, b: any) => a.totalOrders - b.totalOrders,
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (amount: number) => `₹${amount.toLocaleString()}`,
      sorter: (a: any, b: any) => a.totalSpent - b.totalSpent,
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
      render: (segment: string) => {
        const colors: { [key: string]: string } = {
          'Bronze': 'default',
          'Silver': 'blue',
          'Gold': 'gold',
          'Platinum': 'purple',
        };
        return <Tag color={colors[segment]}>{segment}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Last Order',
      dataIndex: 'lastOrder',
      key: 'lastOrder',
      sorter: (a: any, b: any) => new Date(a.lastOrder).getTime() - new Date(b.lastOrder).getTime(),
    },
  ];

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    message.success(`Exporting customer report as ${format.toUpperCase()}...`);
    // Implement actual export functionality
  };

  const handlePrint = () => {
    window.print();
  };

  const fetchReportData = useCallback(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success('Customer report data refreshed');
    }, 1000);
  }, []);

  return (
    <div className={styles.container}>
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <UserOutlined style={{ marginRight: 8 }} />
              Customer Report
            </Title>
            <Text type="secondary">Customer analytics and segmentation insights</Text>
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
            <Text strong>Segment:</Text>
            <Select
              value={selectedSegment}
              onChange={setSelectedSegment}
              style={{ width: '100%', marginTop: 4 }}
            >
              <Option value="all">All Segments</Option>
              <Option value="bronze">Bronze</Option>
              <Option value="silver">Silver</Option>
              <Option value="gold">Gold</Option>
              <Option value="platinum">Platinum</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Text strong>Status:</Text>
            <Select
              defaultValue="all"
              style={{ width: '100%', marginTop: 4 }}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
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

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Total Customers"
              value={1250}
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress percent={75} size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="New Customers"
              value={45}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={85} size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="VIP Customers"
              value={15}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress percent={60} size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Avg. Order Value"
              value={365}
              prefix="₹"
              valueStyle={{ color: '#f5222d' }}
            />
            <Progress percent={68} size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Customer Growth" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newCustomers" stroke="#1890ff" name="New Customers" />
                <Line type="monotone" dataKey="returningCustomers" stroke="#52c41a" name="Returning Customers" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Customer Segments" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                      {customerSegmentData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title="Customer Lifetime Value by Segment" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerLifetimeValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="customers" fill="#1890ff" name="Number of Customers" />
                <Bar yAxisId="right" dataKey="avgValue" fill="#52c41a" name="Average Value (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Customer Table */}
      <Card style={{ borderRadius: 12 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>Customer Details</Title>
          </Col>
          <Col>
            <Space>
              <Input.Search placeholder="Search customers..." style={{ width: 200 }} />
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
          columns={customerColumns}
          dataSource={sampleCustomerData}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default CustomerReport;
