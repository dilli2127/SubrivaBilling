import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  Col,
  Row,
  Table,
  Typography,
  Tag,
  List,
  Badge,
  Space,
  Statistic,
  Progress,
  Divider,
  Tabs,
  Tooltip,
} from 'antd';
import {
  DollarOutlined,
  FileDoneOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  StockOutlined,
  TeamOutlined,
  WarningOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  ShopOutlined,
  BankOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  FireOutlined,
  HourglassOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { dynamic_request, useDynamicSelector } from '../../services/redux';
import { createApiRouteGetter } from '../../helpers/Common_functions';

const { Title, Text } = Typography;

// Color palette for charts
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

const Dashboard: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const getApiRouteDashBoard = createApiRouteGetter('DashBoard');
  const dashboardCount = getApiRouteDashBoard('GetCount');
  const SalesChartData = getApiRouteDashBoard('SalesChartData');
  const PurchaseChartData = getApiRouteDashBoard('PurchaseChartData');
  const FinancialData = getApiRouteDashBoard('SalesChartData' as any);
  const InventoryMetrics = getApiRouteDashBoard('SalesChartData' as any);
  const SalesAnalytics = getApiRouteDashBoard('SalesChartData' as any);
  const OperationsData = getApiRouteDashBoard('SalesChartData' as any);
  const RecentInvoices = getApiRouteDashBoard('SalesChartData' as any);
  const LowStockAlerts = getApiRouteDashBoard('SalesChartData' as any);
  const TopProducts = getApiRouteDashBoard('SalesChartData' as any);
  const TopCustomers = getApiRouteDashBoard('SalesChartData' as any);

  const [activeTab, setActiveTab] = useState('1');

  // Get data from Redux
  const { items: DashBoardItems } = useDynamicSelector(
    dashboardCount.identifier
  );

  const { items: SalesChartDataItems } = useDynamicSelector(
    SalesChartData.identifier
  );

  const { items: FinancialDataItems } = useDynamicSelector(
    FinancialData.identifier
  );

  const { items: InventoryMetricsItems } = useDynamicSelector(
    InventoryMetrics.identifier
  );

  const { items: SalesAnalyticsItems } = useDynamicSelector(
    SalesAnalytics.identifier
  );

  const { items: OperationsDataItems } = useDynamicSelector(
    OperationsData.identifier
  );

  const { items: RecentInvoicesItems } = useDynamicSelector(
    RecentInvoices.identifier
  );

  const { items: LowStockAlertsItems } = useDynamicSelector(
    LowStockAlerts.identifier
  );

  const { items: TopProductsItems } = useDynamicSelector(
    TopProducts.identifier
  );

  const { items: TopCustomersItems } = useDynamicSelector(
    TopCustomers.identifier
  );

  // Use API data or fallback to empty arrays
  const recentInvoices = RecentInvoicesItems?.result || [];
  const stockAlerts = LowStockAlertsItems?.result || [];
  const topProducts = TopProductsItems?.result || [];
  const topCustomers = TopCustomersItems?.result || [];

  // Keyboard navigation for tabs
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        setActiveTab(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const cardGradientStyle = (gradient: string) => ({
    borderRadius: 16,
    background: gradient,
    color: '#fff',
    textAlign: 'center' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  });
  const fetchData = useCallback(() => {
    [
      dashboardCount,
      SalesChartData,
      PurchaseChartData,
      FinancialData,
      InventoryMetrics,
      SalesAnalytics,
      OperationsData,
      RecentInvoices,
      LowStockAlerts,
      TopProducts,
      TopCustomers,
    ].forEach(route => {
      dispatch(
        dynamic_request(
          { method: route.method, endpoint: route.endpoint, data: {} },
          route.identifier
        )
      );
    });
  }, [
    dispatch,
    dashboardCount,
    SalesChartData,
    PurchaseChartData,
    FinancialData,
    InventoryMetrics,
    SalesAnalytics,
    OperationsData,
    RecentInvoices,
    LowStockAlerts,
    TopProducts,
    TopCustomers,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // Render Overview Tab
  const renderOverviewTab = () => (
    <div>
      {/* Primary Metrics - Row 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #667eea, #764ba2)'
            )}
            bordered={false}
            hoverable
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <DollarOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Today's Sales
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{DashBoardItems?.result?.todaysSales || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                <ArrowUpOutlined /> +
                {DashBoardItems?.result?.todaysSalesGrowth || 12}% from
                yesterday
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #43cea2, #185a9d)'
            )}
            bordered={false}
            hoverable
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <FileDoneOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Pending Receivables
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{DashBoardItems?.result?.pendingReceivables || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                From {DashBoardItems?.result?.pendingInvoicesCount || 0}{' '}
                invoices
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #f093fb, #f5576c)'
            )}
            bordered={false}
            hoverable
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <ShoppingCartOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Monthly Revenue
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{DashBoardItems?.result?.monthlyRevenue || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                Target: ₹{DashBoardItems?.result?.monthlyTarget || '500000'}
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #ff6a00, #ee0979)'
            )}
            bordered={false}
            hoverable
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <UserOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Total Customers
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                {DashBoardItems?.result?.totalCustomers || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                <ArrowUpOutlined /> +
                {DashBoardItems?.result?.newCustomersThisMonth || 5} this month
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Products"
              value={DashBoardItems?.result?.totalProducts || 0}
              prefix={<StockOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Low Stock Items"
              value={DashBoardItems?.result?.lowStockCount || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Today's Orders"
              value={DashBoardItems?.result?.todaysOrders || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12 }}>
            <Statistic
              title="Profit Margin"
              value={DashBoardItems?.result?.profitMargin || 0}
              prefix={<RiseOutlined />}
              suffix="%"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <RiseOutlined style={{ color: '#1890ff' }} />
                <span>Sales & Purchase Trends</span>
              </Space>
            }
            style={{ borderRadius: 16 }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={SalesChartDataItems?.result}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#667eea"
                  strokeWidth={2}
                  name="Sales (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="purchase"
                  stroke="#f093fb"
                  strokeWidth={2}
                  name="Purchase (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <span>Low Stock Alerts</span>
              </Space>
            }
            style={{ borderRadius: 16 }}
          >
            <List
              dataSource={stockAlerts.slice(0, 3)}
              size="small"
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge status="error" />}
                    title={<Text strong>{item.name || item.item}</Text>}
                    description={`Stock: ${item.quantity} (Min: ${item.reorderLevel})`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Render Finance Tab
  const renderFinanceTab = () => (
    <div>
      {/* Financial Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #11998e, #38ef7d)'
            )}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <WalletOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Today's Profit
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{FinancialDataItems?.result?.todaysProfit || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                Margin: {FinancialDataItems?.result?.todaysProfitMargin || 0}%
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #ee0979, #ff6a00)'
            )}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <BankOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Pending Payables
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{FinancialDataItems?.result?.pendingPayables || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                To {FinancialDataItems?.result?.vendorsCount || 0} vendors
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #fc4a1a, #f7b733)'
            )}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <ArrowDownOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Monthly Expenses
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{FinancialDataItems?.result?.monthlyExpenses || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                <ArrowUpOutlined /> +
                {FinancialDataItems?.result?.expensesGrowth || 0}% vs last month
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #4776e6, #8e54e9)'
            )}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <SwapOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Cash Flow
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{FinancialDataItems?.result?.cashFlow || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                {(FinancialDataItems?.result?.cashFlow || 0) >= 0
                  ? 'Positive'
                  : 'Negative'}
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Comparative Analytics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Week-over-Week" bordered={false}>
            <Statistic
              title="Current Week Sales"
              value={FinancialDataItems?.result?.currentWeekSales || 0}
              prefix="₹"
              valueStyle={{ color: '#3f8600' }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space>
              <Text type="secondary">Last Week:</Text>
              <Text>₹{FinancialDataItems?.result?.lastWeekSales || 0}</Text>
            </Space>
            <br />
            <Space>
              <Text type="secondary">Growth:</Text>
              {(FinancialDataItems?.result?.weekOverWeekGrowth || 0) >= 0 ? (
                <Text style={{ color: '#3f8600' }}>
                  <ArrowUpOutlined />
                  {FinancialDataItems?.result?.weekOverWeekGrowth || 0}%
                </Text>
              ) : (
                <Text style={{ color: '#cf1322' }}>
                  <ArrowDownOutlined />
                  {Math.abs(FinancialDataItems?.result?.weekOverWeekGrowth || 0)}
                  %
                </Text>
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Month-over-Month" bordered={false}>
            <Statistic
              title="Current Month Sales"
              value={FinancialDataItems?.result?.currentMonthSales || 0}
              prefix="₹"
              valueStyle={{ color: '#1890ff' }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space>
              <Text type="secondary">Last Month:</Text>
              <Text>₹{FinancialDataItems?.result?.lastMonthSales || 0}</Text>
            </Space>
            <br />
            <Space>
              <Text type="secondary">Growth:</Text>
              {(FinancialDataItems?.result?.monthOverMonthGrowth || 0) >= 0 ? (
                <Text style={{ color: '#3f8600' }}>
                  <ArrowUpOutlined />
                  {FinancialDataItems?.result?.monthOverMonthGrowth || 0}%
                </Text>
              ) : (
                <Text style={{ color: '#cf1322' }}>
                  <ArrowDownOutlined />
                  {Math.abs(
                    FinancialDataItems?.result?.monthOverMonthGrowth || 0
                  )}
                  %
                </Text>
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Year-over-Year" bordered={false}>
            <Statistic
              title="Current Year Sales"
              value={FinancialDataItems?.result?.currentYearSales || 0}
              prefix="₹"
              valueStyle={{ color: '#722ed1' }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Space>
              <Text type="secondary">Last Year:</Text>
              <Text>₹{FinancialDataItems?.result?.lastYearSales || 0}</Text>
            </Space>
            <br />
            <Space>
              <Text type="secondary">Growth:</Text>
              {(FinancialDataItems?.result?.yearOverYearGrowth || 0) >= 0 ? (
                <Text style={{ color: '#3f8600' }}>
                  <ArrowUpOutlined />
                  {FinancialDataItems?.result?.yearOverYearGrowth || 0}%
                </Text>
              ) : (
                <Text style={{ color: '#cf1322' }}>
                  <ArrowDownOutlined />
                  {Math.abs(FinancialDataItems?.result?.yearOverYearGrowth || 0)}
                  %
                </Text>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Payment Collections & Recent Invoices */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Payment Collection Status" bordered={false}>
            <Progress
              percent={FinancialDataItems?.result?.paymentCollectionRate || 0}
              strokeColor="#52c41a"
              status="active"
            />
            <Divider />
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Collected"
                  value={FinancialDataItems?.result?.collectedAmount || 0}
                  prefix="₹"
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Pending"
                  value={FinancialDataItems?.result?.pendingAmount || 0}
                  prefix="₹"
                  valueStyle={{ fontSize: 16, color: '#fa8c16' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Overdue"
                  value={FinancialDataItems?.result?.overdueAmount || 0}
                  prefix="₹"
                  valueStyle={{ fontSize: 16, color: '#f5222d' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Invoices" bordered={false}>
            <Table
              dataSource={recentInvoices.slice(0, 5)}
              columns={[
                {
                  title: 'Invoice',
                  dataIndex: 'invoice',
                  width: 100,
                },
                {
                  title: 'Customer',
                  dataIndex: 'customer',
                  ellipsis: true,
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  width: 90,
                  render: (amt: number) => `₹${amt}`,
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  width: 80,
                  render: (status: string) => (
                    <Tag
                      color={
                        status === 'Paid'
                          ? 'success'
                          : status === 'Partial'
                            ? 'warning'
                            : 'error'
                      }
                    >
                      {status}
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

  // Render Inventory Tab
  const renderInventoryTab = () => (
    <div>
      {/* Inventory Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #fbc2eb, #a6c1ee)'
            )}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <DollarOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Total Stock Value
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                ₹{InventoryMetricsItems?.result?.totalStockValue || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                {InventoryMetricsItems?.result?.totalItems || 0} items
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #fa709a, #fee140)'
            )}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <HourglassOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Dead Stock
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                {InventoryMetricsItems?.result?.deadStockCount || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                Not sold in 90+ days
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #30cfd0, #330867)'
            )}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <FireOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Fast Moving
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                {InventoryMetricsItems?.result?.fastMovingCount || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                High turnover items
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={cardGradientStyle(
              'linear-gradient(135deg, #a8edea, #fed6e3)'
            )}
            bordered={false}
          >
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <SyncOutlined style={{ fontSize: 40, color: '#fff' }} />
              <Title level={5} style={{ color: '#fff', margin: 0 }}>
                Slow Moving
              </Title>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
                {InventoryMetricsItems?.result?.slowMovingCount || '0'}
              </Title>
              <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>
                Low turnover items
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Stock Status Details */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Stock Status Breakdown" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card style={{ background: '#f6ffed', border: 'none' }}>
                  <Statistic
                    title="In Stock"
                    value={InventoryMetricsItems?.result?.inStockCount || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ background: '#fff1f0', border: 'none' }}>
                  <Statistic
                    title="Out of Stock"
                    value={InventoryMetricsItems?.result?.outOfStockCount || 0}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ background: '#fff7e6', border: 'none' }}>
                  <Statistic
                    title="Low Stock"
                    value={InventoryMetricsItems?.result?.lowStockCount || 0}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ background: '#f0f5ff', border: 'none' }}>
                  <Statistic
                    title="Reorder Needed"
                    value={InventoryMetricsItems?.result?.reorderCount || 0}
                    prefix={<SyncOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Inventory Turnover" bordered={false}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={InventoryMetricsItems?.result?.categoryWiseStock || []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Dead Stock & Fast/Slow Moving Lists */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <HourglassOutlined style={{ color: '#fa8c16' }} />
                <span>Dead Stock Items</span>
              </Space>
            }
            bordered={false}
          >
            <List
              dataSource={InventoryMetricsItems?.result?.deadStockItems || []}
              size="small"
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text>{item.name}</Text>}
                    description={`Last sold: ${item.lastSoldDays} days ago`}
                  />
                  <Text type="secondary">Qty: {item.quantity}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <FireOutlined style={{ color: '#52c41a' }} />
                <span>Fast Moving Items</span>
              </Space>
            }
            bordered={false}
          >
            <List
              dataSource={InventoryMetricsItems?.result?.fastMovingItems || []}
              size="small"
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text>{item.name}</Text>}
                    description={`Turnover: ${item.turnoverRate}x/month`}
                  />
                  <Tag color="success">{item.soldCount} sold</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <SyncOutlined style={{ color: '#1890ff' }} />
                <span>Slow Moving Items</span>
              </Space>
            }
            bordered={false}
          >
            <List
              dataSource={InventoryMetricsItems?.result?.slowMovingItems || []}
              size="small"
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text>{item.name}</Text>}
                    description={`Turnover: ${item.turnoverRate}x/month`}
                  />
                  <Tag color="warning">{item.soldCount} sold</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Render Sales Analysis Tab
  const renderSalesAnalysisTab = () => (
    <div>
      {/* Top Products & Customers */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined style={{ color: '#52c41a' }} />
                <span>Top Products</span>
              </Space>
            }
            bordered={false}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <RechartsTooltip />
                <Bar dataKey="sales" fill="#52c41a" radius={[0, 10, 10, 0]}>
                  {topProducts.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TeamOutlined style={{ color: '#722ed1' }} />
                <span>Top Customers</span>
              </Space>
            }
            bordered={false}
          >
            <List
              dataSource={topCustomers.slice(0, 5)}
              renderItem={(customer: any, index: number) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: COLORS[index % COLORS.length],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      >
                        {index + 1}
                      </div>
                    }
                    title={<Text strong>{customer.name}</Text>}
                    description={`${customer.invoiceCount} invoices`}
                  />
                  <Space direction="vertical" align="end" size={0}>
                    <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                      ₹{customer.totalPurchase?.toLocaleString()}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Category-wise Sales */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Top Selling Categories" bordered={false}>
            <List
              dataSource={SalesAnalyticsItems?.result?.topCategories || []}
              renderItem={(cat: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text strong>{cat.name}</Text>}
                    description={`${cat.productCount} products`}
                  />
                  <Space direction="vertical" align="end">
                    <Text strong>₹{cat.sales?.toLocaleString()}</Text>
                    <Progress
                      percent={cat.percentage}
                      size="small"
                      style={{ width: 100 }}
                    />
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sales Performance Metrics" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Avg. Order Value"
                  value={SalesAnalyticsItems?.result?.avgOrderValue || 0}
                  prefix="₹"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Conversion Rate"
                  value={SalesAnalyticsItems?.result?.conversionRate || 0}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Total Orders"
                  value={SalesAnalyticsItems?.result?.totalOrders || 0}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Total Revenue"
                  value={SalesAnalyticsItems?.result?.totalRevenue || 0}
                  prefix="₹"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Monthly Sales Target Progress</Text>
              <Progress
                percent={SalesAnalyticsItems?.result?.salesTargetProgress || 0}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                status="active"
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Render Operations Tab
  const renderOperationsTab = () => (
    <div>
      {/* Operations Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Vendors"
              value={OperationsDataItems?.result?.totalVendors || 0}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Returns This Month"
              value={OperationsDataItems?.result?.returnsThisMonth || 0}
              prefix={<SwapOutlined />}
              valueStyle={{ color: '#fa8c16' }}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  / {OperationsDataItems?.result?.totalOrders || 0}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Return Rate"
              value={OperationsDataItems?.result?.returnRate || 0}
              suffix="%"
              precision={1}
              valueStyle={{
                color:
                  (OperationsDataItems?.result?.returnRate || 0) > 5
                    ? '#cf1322'
                    : '#3f8600',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Pending Orders"
              value={OperationsDataItems?.result?.pendingOrders || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Methods Breakdown */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Payment Methods (This Month)" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={OperationsDataItems?.result?.paymentMethods || []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" name="Amount (₹)">
                  {(OperationsDataItems?.result?.paymentMethods || []).map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Credit vs Cash Sales" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card style={{ background: '#f6ffed', border: 'none' }}>
                  <Statistic
                    title="Cash Sales"
                    value={OperationsDataItems?.result?.cashSales || 0}
                    prefix="₹"
                    valueStyle={{ color: '#52c41a', fontSize: 20 }}
                  />
                  <Text type="secondary">
                    {OperationsDataItems?.result?.cashSalesPercentage || 0}% of
                    total
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ background: '#fff7e6', border: 'none' }}>
                  <Statistic
                    title="Credit Sales"
                    value={OperationsDataItems?.result?.creditSales || 0}
                    prefix="₹"
                    valueStyle={{ color: '#fa8c16', fontSize: 20 }}
                  />
                  <Text type="secondary">
                    {OperationsDataItems?.result?.creditSalesPercentage || 0}% of
                    total
                  </Text>
                </Card>
              </Col>
            </Row>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Credit Sales Ratio</Text>
              <Progress
                percent={
                  OperationsDataItems?.result?.creditSalesPercentage || 0
                }
                strokeColor="#fa8c16"
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Returns & Top Vendors */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SwapOutlined style={{ color: '#fa8c16' }} />
                <span>Recent Returns</span>
              </Space>
            }
            bordered={false}
          >
            <Table
              dataSource={OperationsDataItems?.result?.recentReturns || []}
              columns={[
                { title: 'Invoice', dataIndex: 'invoice', width: 100 },
                { title: 'Product', dataIndex: 'product', ellipsis: true },
                {
                  title: 'Reason',
                  dataIndex: 'reason',
                  width: 120,
                  ellipsis: true,
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  width: 90,
                  render: (amt: number) => `₹${amt}`,
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TruckOutlined style={{ color: '#1890ff' }} />
                <span>Top Vendors</span>
              </Space>
            }
            bordered={false}
          >
            <List
              dataSource={OperationsDataItems?.result?.topVendors || []}
              renderItem={(vendor: any, index: number) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 35,
                          height: 35,
                          borderRadius: '50%',
                          background: COLORS[index % COLORS.length],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: 12,
                        }}
                      >
                        {index + 1}
                      </div>
                    }
                    title={<Text>{vendor.name}</Text>}
                    description={`${vendor.purchaseCount} purchases`}
                  />
                  <Text strong>₹{vendor.totalPurchase?.toLocaleString()}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Render Performance Tab (Branches & Staff)
  const renderPerformanceTab = () => (
    <div>
      {/* Branch Performance */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <ShopOutlined style={{ color: '#1890ff' }} />
                <span>Branch-wise Performance</span>
              </Space>
            }
            bordered={false}
          >
            <Table
              dataSource={SalesAnalyticsItems?.result?.branchPerformance || []}
              columns={[
                {
                  title: 'Branch',
                  dataIndex: 'branchName',
                  key: 'branchName',
                },
                {
                  title: 'Sales',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (val: number) => `₹${val?.toLocaleString()}`,
                  sorter: (a: any, b: any) => a.sales - b.sales,
                },
                {
                  title: 'Orders',
                  dataIndex: 'orders',
                  key: 'orders',
                  sorter: (a: any, b: any) => a.orders - b.orders,
                },
                {
                  title: 'Avg Order',
                  dataIndex: 'avgOrder',
                  key: 'avgOrder',
                  render: (val: number) => `₹${val?.toLocaleString()}`,
                },
                {
                  title: 'Growth',
                  dataIndex: 'growth',
                  key: 'growth',
                  render: (val: number) => (
                    <Tag color={val >= 0 ? 'success' : 'error'}>
                      {val >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {Math.abs(val)}%
                    </Tag>
                  ),
                  sorter: (a: any, b: any) => a.growth - b.growth,
                },
                {
                  title: 'Performance',
                  dataIndex: 'performance',
                  key: 'performance',
                  render: (val: number) => (
                    <Progress
                      percent={val}
                      size="small"
                      status={val >= 75 ? 'success' : val >= 50 ? 'normal' : 'exception'}
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

      {/* Staff Performance */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <TeamOutlined style={{ color: '#52c41a' }} />
                <span>Sales Person Performance</span>
              </Space>
            }
            bordered={false}
          >
            <Table
              dataSource={SalesAnalyticsItems?.result?.staffPerformance || []}
              columns={[
                {
                  title: 'Name',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Sales',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (val: number) => `₹${val?.toLocaleString()}`,
                  sorter: (a: any, b: any) => a.sales - b.sales,
                },
                {
                  title: 'Orders',
                  dataIndex: 'orders',
                  key: 'orders',
                  sorter: (a: any, b: any) => a.orders - b.orders,
                },
                {
                  title: 'Customers',
                  dataIndex: 'customers',
                  key: 'customers',
                  sorter: (a: any, b: any) => a.customers - b.customers,
                },
                {
                  title: 'Avg Deal Size',
                  dataIndex: 'avgDealSize',
                  key: 'avgDealSize',
                  render: (val: number) => `₹${val?.toLocaleString()}`,
                },
                {
                  title: 'Target Achievement',
                  dataIndex: 'targetAchievement',
                  key: 'targetAchievement',
                  render: (val: number) => (
                    <Progress
                      percent={val}
                      size="small"
                      strokeColor={
                        val >= 100
                          ? '#52c41a'
                          : val >= 75
                            ? '#1890ff'
                            : '#fa8c16'
                      }
                    />
                  ),
                  sorter: (a: any, b: any) =>
                    a.targetAchievement - b.targetAchievement,
                },
                {
                  title: 'Rating',
                  dataIndex: 'rating',
                  key: 'rating',
                  render: (val: string) => (
                    <Tag
                      color={
                        val === 'Excellent'
                          ? 'success'
                          : val === 'Good'
                            ? 'processing'
                            : val === 'Average'
                              ? 'warning'
                              : 'default'
                      }
                    >
                      {val}
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

      {/* Additional Metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="User Activity Log" bordered={false}>
            <List
              dataSource={SalesAnalyticsItems?.result?.userActivityLog || []}
              size="small"
              renderItem={(activity: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text>{activity.userName}</Text>}
                    description={activity.action}
                  />
                  <Text type="secondary">{activity.time}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Performance Summary" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Total Branches"
                  value={
                    SalesAnalyticsItems?.result?.branchPerformance?.length || 0
                  }
                  prefix={<ShopOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Total Staff"
                  value={
                    SalesAnalyticsItems?.result?.staffPerformance?.length || 0
                  }
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Best Branch"
                  value={
                    SalesAnalyticsItems?.result?.bestBranch?.name || 'N/A'
                  }
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Top Performer"
                  value={
                    SalesAnalyticsItems?.result?.topPerformer?.name || 'N/A'
                  }
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div
      style={{
        padding: 24,
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          📊 Business Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Monitor your business performance and key metrics
        </Text>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={[
          {
            key: '1',
            label: (
              <Tooltip title="Ctrl+1">
                <span>
                  <BarChartOutlined /> Overview
                </span>
              </Tooltip>
            ),
            children: renderOverviewTab(),
          },
          {
            key: '2',
            label: (
              <Tooltip title="Ctrl+2">
                <span>
                  <WalletOutlined /> Finance
                </span>
              </Tooltip>
            ),
            children: renderFinanceTab(),
          },
          {
            key: '3',
            label: (
              <Tooltip title="Ctrl+3">
                <span>
                  <StockOutlined /> Inventory
                </span>
              </Tooltip>
            ),
            children: renderInventoryTab(),
          },
          {
            key: '4',
            label: (
              <Tooltip title="Ctrl+4">
                <span>
                  <RiseOutlined /> Sales Analysis
                </span>
              </Tooltip>
            ),
            children: renderSalesAnalysisTab(),
          },
          {
            key: '5',
            label: (
              <Tooltip title="Ctrl+5">
                <span>
                  <CreditCardOutlined /> Operations
                </span>
              </Tooltip>
            ),
            children: renderOperationsTab(),
          },
          {
            key: '6',
            label: (
              <Tooltip title="Ctrl+6">
                <span>
                  <TeamOutlined /> Performance
                </span>
              </Tooltip>
            ),
            children: renderPerformanceTab(),
          },
        ]}
      />
    </div>
  );
};

export default Dashboard;
