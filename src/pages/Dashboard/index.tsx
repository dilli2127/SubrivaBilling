import React, { useCallback, useEffect } from "react";
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
} from "antd";
import {
  DollarOutlined,
  FileDoneOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useDispatch } from "react-redux";
import type { Dispatch } from "redux";
import { dynamic_request, useDynamicSelector } from "../../services/redux";
import { createApiRouteGetter } from "../../helpers/Common_functions";

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const today = new Date().toLocaleDateString();
  const getApiRouteDashBoard = createApiRouteGetter("DashBoard");
  const dashboardCount = getApiRouteDashBoard("GetCount");
  const SalesChartData = getApiRouteDashBoard("SalesChartData");
  const PurchaseChartData = getApiRouteDashBoard("PurchaseChartData");

  const { loading: dashboard_loading, items: DashBoardItems } =
    useDynamicSelector(dashboardCount.identifier);

  const { loading: sales_data_loading, items: SalesChartDataItems } =
    useDynamicSelector(SalesChartData.identifier);
  const { loading: purchase_data_loading, items: purchaseData } =
    useDynamicSelector(PurchaseChartData.identifier);

  const recentInvoices = [
    { invoice: "INV-0012", customer: "John", amount: 4500, status: "Paid" },
    { invoice: "INV-0013", customer: "Ravi", amount: 8000, status: "Unpaid" },
  ];

  const stockAlerts = [
    { item: "Paracetamol", quantity: 5 },
    { item: "Amoxicillin", quantity: 2 },
    { item: "Amoxicillin", quantity: 2 },
  ];

  const transactions = [
    { date: today, type: "Sale", amount: 18000 },
    { date: today, type: "Purchase", amount: 7200 },
  ];

  const cardGradientStyle = (gradient: string) => ({
    borderRadius: 16,
    background: gradient,
    color: "#fff",
    textAlign: "center" as const,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  });
  const fetchData = useCallback(() => {
    [dashboardCount, SalesChartData, PurchaseChartData].forEach((route) => {
      dispatch(
        dynamic_request(
          { method: route.method, endpoint: route.endpoint, data: {} },
          route.identifier
        )
      );
    });
  }, [dispatch]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <div
      style={{ padding: 24, backgroundColor: "#f0f2f5", minHeight: "100vh" }}
    >
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card
            style={cardGradientStyle(
              "linear-gradient(135deg, #667eea, #764ba2)"
            )}
            bordered={false}
          >
            <Space direction="vertical" align="center">
              <DollarOutlined style={{ fontSize: 32, color: "#fff" }} />
              <Title level={5} style={{ color: "#fff", margin: 0 }}>
                Today's Sale
              </Title>
              <Text strong style={{ fontSize: 20, color: "#fff" }}>
                {DashBoardItems?.result?.todaysSales}
              </Text>
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={cardGradientStyle(
              "linear-gradient(135deg, #43cea2, #185a9d)"
            )}
            bordered={false}
          >
            <Space direction="vertical" align="center">
              <FileDoneOutlined style={{ fontSize: 32, color: "#fff" }} />
              <Title level={5} style={{ color: "#fff", margin: 0 }}>
                Pending Receivables
              </Title>
              <Text strong style={{ fontSize: 20, color: "#fff" }}>
                {DashBoardItems?.result?.pendingReceivables}
              </Text>
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={cardGradientStyle(
              "linear-gradient(135deg, #f7971e, #ffd200)"
            )}
            bordered={false}
          >
            <Space direction="vertical" align="center">
              <ExclamationCircleOutlined
                style={{ fontSize: 32, color: "#fff" }}
              />
              <Title level={5} style={{ color: "#fff", margin: 0 }}>
                Due Amount
              </Title>
              <Text strong style={{ fontSize: 20, color: "#fff" }}>
                ₹3,000
              </Text>
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            style={cardGradientStyle(
              "linear-gradient(135deg, #ff6a00, #ee0979)"
            )}
            bordered={false}
          >
            <Space direction="vertical" align="center">
              <UserOutlined style={{ fontSize: 32, color: "#fff" }} />
              <Title level={5} style={{ color: "#fff", margin: 0 }}>
                Total Customers
              </Title>
              <Text strong style={{ fontSize: 20, color: "#fff" }}>
                {DashBoardItems?.result?.totalCustomers}
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="📈 Sale Overview" style={{ borderRadius: 16 }}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={SalesChartDataItems?.result}>
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="📊 Purchase Overview" style={{ borderRadius: 16 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={purchaseData?.result}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#ffc658" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="🧾 Recent Invoices" style={{ borderRadius: 16 }}>
            <Table
              dataSource={recentInvoices}
              columns={[
                { title: "Invoice", dataIndex: "invoice" },
                { title: "Customer", dataIndex: "customer" },
                {
                  title: "Amount",
                  dataIndex: "amount",
                  render: (amt: number) => `₹${amt}`,
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  render: (status: string) => (
                    <Tag color={status === "Paid" ? "green" : "red"}>
                      {status}
                    </Tag>
                  ),
                },
              ]}
              pagination={false}
              rowKey="invoice"
              size="middle"
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="📦 Stock Alerts" style={{ borderRadius: 16 }}>
            <List
              dataSource={stockAlerts}
              renderItem={(item: { item: string; quantity: number }) => (
                <List.Item>
                  <Badge status="warning" />
                  <Text strong>
                    {item.item} - Only {item.quantity} left
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="💼 Transaction History" style={{ borderRadius: 16 }}>
            <Table
              dataSource={transactions}
              columns={[
                { title: "Date", dataIndex: "date" },
                { title: "Type", dataIndex: "type" },
                {
                  title: "Amount",
                  dataIndex: "amount",
                  render: (amt: number) => `₹${amt}`,
                },
              ]}
              pagination={false}
              rowKey={(record: {
                date: string;
                type: string;
                amount: number;
              }) => `${record.type}-${record.date}`}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
