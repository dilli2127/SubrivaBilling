import React from "react";
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
import { Area, Column } from "@ant-design/charts";

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const today = new Date().toLocaleDateString();

  const salesData = [
    { date: "2025-06-11", sales: 12000 },
    { date: "2025-06-12", sales: 9000 },
    { date: "2025-06-13", sales: 16000 },
    { date: "2025-06-14", sales: 14000 },
    { date: "2025-06-15", sales: 11000 },
    { date: today, sales: 18000 },
  ];

  const purchaseData = [
    { date: "2025-06-11", amount: 7000 },
    { date: "2025-06-12", amount: 5000 },
    { date: "2025-06-13", amount: 8000 },
    { date: "2025-06-14", amount: 6500 },
    { date: "2025-06-15", amount: 9000 },
    { date: today, amount: 7200 },
  ];

  const recentInvoices = [
    { invoice: "INV-0012", customer: "John", amount: 4500, status: "Paid" },
    { invoice: "INV-0013", customer: "Ravi", amount: 8000, status: "Unpaid" },
  ];

  const stockAlerts = [
    { item: "Paracetamol", quantity: 5 },
    { item: "Amoxicillin", quantity: 2 },
  ];

  const transactions = [
    { date: today, type: "Sale", amount: 18000 },
    { date: today, type: "Purchase", amount: 7200 },
  ];

  const areaConfig = {
    data: salesData,
    xField: "date",
    yField: "sales",
    smooth: true,
    autoFit: true,
    areaStyle: () => ({
      fill: "l(270) 0:#bae7ff 0.5:#69c0ff 1:#0050b3",
    }),
    line: {
      style: {
        stroke: "#096dd9",
        lineWidth: 2,
      },
    },
  };

  const columnConfig = {
    data: purchaseData,
    xField: "date",
    yField: "amount",
    autoFit: true,
    columnStyle: {
      fill: "l(90) 0:#fff1b8 0.5:#ffe58f 1:#d4b106",
      radius: [6, 6, 0, 0],
    },
  };

  const cardGradientStyle = (gradient: string) => ({
    borderRadius: 16,
    background: gradient,
    color: "#fff",
    textAlign: "center" as const,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  });

  return (
    <div style={{ padding: 24, backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
    <Row gutter={[16, 16]}>
  <Col span={6}>
    <Card style={cardGradientStyle("linear-gradient(135deg, #667eea, #764ba2)")} bordered={false}>
      <Space direction="vertical" align="center">
        <DollarOutlined style={{ fontSize: 32, color: "#fff" }} />
        <Title level={5} style={{ color: "#fff", margin: 0 }}>Today’s Sale</Title>
        <Text strong style={{ fontSize: 20, color: "#fff" }}>₹18,000</Text>
      </Space>
    </Card>
  </Col>

  <Col span={6}>
    <Card style={cardGradientStyle("linear-gradient(135deg, #43cea2, #185a9d)")} bordered={false}>
      <Space direction="vertical" align="center">
        <FileDoneOutlined style={{ fontSize: 32, color: "#fff" }} />
        <Title level={5} style={{ color: "#fff", margin: 0 }}>Payment Received</Title>
        <Text strong style={{ fontSize: 20, color: "#fff" }}>₹15,000</Text>
      </Space>
    </Card>
  </Col>

  <Col span={6}>
    <Card style={cardGradientStyle("linear-gradient(135deg, #f7971e, #ffd200)")} bordered={false}>
      <Space direction="vertical" align="center">
        <ExclamationCircleOutlined style={{ fontSize: 32, color: "#fff" }} />
        <Title level={5} style={{ color: "#fff", margin: 0 }}>Due Amount</Title>
        <Text strong style={{ fontSize: 20, color: "#fff" }}>₹3,000</Text>
      </Space>
    </Card>
  </Col>

  <Col span={6}>
    <Card style={cardGradientStyle("linear-gradient(135deg, #ff6a00, #ee0979)")} bordered={false}>
      <Space direction="vertical" align="center">
        <UserOutlined style={{ fontSize: 32, color: "#fff" }} />
        <Title level={5} style={{ color: "#fff", margin: 0 }}>Total Customers</Title>
        <Text strong style={{ fontSize: 20, color: "#fff" }}>325</Text>
      </Space>
    </Card>
  </Col>
</Row>


      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="📈 Sales Overview" style={{ borderRadius: 16 }}>
            <Area {...areaConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="📊 Purchase Overview" style={{ borderRadius: 16 }}>
            <Column {...columnConfig} />
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
                    <Tag color={status === "Paid" ? "green" : "red"}>{status}</Tag>
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
              rowKey={(record: { date: string; type: string; amount: number }) => `${record.type}-${record.date}`}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
