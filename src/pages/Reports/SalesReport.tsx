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
  Input,
  message,
  Tag,
  Divider,
} from 'antd';
import {
  BarChartOutlined,
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

const SalesReport: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Sample data for demonstration
  const salesData = [
    { name: 'Jan', sales: 4000, profit: 2400, orders: 24 },
    { name: 'Feb', sales: 3000, profit: 1398, orders: 13 },
    { name: 'Mar', sales: 2000, profit: 9800, orders: 98 },
    { name: 'Apr', sales: 2780, profit: 3908, orders: 39 },
    { name: 'May', sales: 1890, profit: 4800, orders: 48 },
    { name: 'Jun', sales: 2390, profit: 3800, orders: 38 },
  ];

  const sampleReportData = [
    { 
      date: '2024-01-15', 
      invoiceNo: 'INV-001', 
      customer: 'John Doe', 
      amount: 2500, 
      status: 'Paid',
      product: 'Product A',
      quantity: 2,
      discount: 100,
      tax: 250
    },
    { 
      date: '2024-01-16', 
      invoiceNo: 'INV-002', 
      customer: 'Jane Smith', 
      amount: 1800, 
      status: 'Pending',
      product: 'Product B',
      quantity: 1,
      discount: 0,
      tax: 180
    },
    { 
      date: '2024-01-17', 
      invoiceNo: 'INV-003', 
      customer: 'Bob Johnson', 
      amount: 3200, 
      status: 'Paid',
      product: 'Product C',
      quantity: 3,
      discount: 200,
      tax: 320
    },
    { 
      date: '2024-01-18', 
      invoiceNo: 'INV-004', 
      customer: 'Alice Brown', 
      amount: 1500, 
      status: 'Overdue',
      product: 'Product D',
      quantity: 1,
      discount: 50,
      tax: 150
    },
  ];

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
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₹${amount.toLocaleString()}`,
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount: number) => `₹${discount.toLocaleString()}`,
    },
    {
      title: 'Tax',
      dataIndex: 'tax',
      key: 'tax',
      render: (tax: number) => `₹${tax.toLocaleString()}`,
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

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    message.success(`Exporting sales report as ${format.toUpperCase()}...`);
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
      message.success('Sales report data refreshed');
    }, 1000);
  }, []);

  return (
    <div className={styles.container}>
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <BarChartOutlined style={{ marginRight: 8 }} />
              Sales Report
            </Title>
            <Text type="secondary">Detailed sales analysis and transaction history</Text>
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
            <Text strong>Status:</Text>
            <Select
              defaultValue="all"
              style={{ width: '100%', marginTop: 4 }}
            >
              <Option value="all">All Status</Option>
              <Option value="paid">Paid</Option>
              <Option value="pending">Pending</Option>
              <Option value="overdue">Overdue</Option>
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
              title="Total Sales"
              value={125000}
              prefix="₹"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Total Orders"
              value={342}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Average Order Value"
              value={365}
              prefix="₹"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic
              title="Conversion Rate"
              value={68.5}
              suffix="%"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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
          <Card title="Sales vs Profit" style={{ borderRadius: 12 }}>
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

      {/* Sales Table */}
      <Card style={{ borderRadius: 12 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>Sales Transactions</Title>
          </Col>
          <Col>
            <Space>
              <Input.Search placeholder="Search invoices..." style={{ width: 200 }} />
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
          scroll={{ x: 1000 }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default SalesReport;
