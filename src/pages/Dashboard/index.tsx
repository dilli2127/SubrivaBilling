import React from "react";
import {
  Card,
  Col,
  Row,
  Table,
  Button,
  Typography,
  Space,
  Tag,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  FileDoneOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Area } from "@ant-design/charts";

const { Title } = Typography;

const Dashboard = () => {
  const summaryCards = [
    {
      title: "Total Sales",
      value: "₹1,20,000",
      icon: <DollarOutlined style={{ fontSize: 24 }} />,
      color: "linear-gradient(to right, #00b4db, #0083b0)",
    },
    {
      title: "Due Amount",
      value: "₹25,000",
      icon: <FileDoneOutlined style={{ fontSize: 24 }} />,
      color: "linear-gradient(to right, #f85032, #e73827)",
    },
    {
      title: "Paid Amount",
      value: "₹95,000",
      icon: <DollarOutlined style={{ fontSize: 24 }} />,
      color: "linear-gradient(to right, #56ab2f, #a8e063)",
    },
    {
      title: "Total Customers",
      value: "120",
      icon: <UserOutlined style={{ fontSize: 24 }} />,
      color: "linear-gradient(to right, #fc466b, #3f5efb)",
    },
  ];

  const transactions = [
    {
      key: "1",
      customer: "John Doe",
      amount: "₹2,000",
      status: "Paid",
    },
    {
      key: "2",
      customer: "Ravi Kumar",
      amount: "₹5,000",
      status: "Due",
    },
    {
      key: "3",
      customer: "Priya",
      amount: "₹1,500",
      status: "Paid",
    },
  ];

  const chartConfig = {
    data: [
      { date: "2025-05-01", value: 20000 },
      { date: "2025-05-02", value: 30000 },
      { date: "2025-05-03", value: 25000 },
      { date: "2025-05-04", value: 40000 },
      { date: "2025-05-05", value: 50000 },
    ],
    xField: "date",
    yField: "value",
    smooth: true,
    areaStyle: { fill: "l(270) 0:#3f5efb 1:#fc466b" },
  };

  return (
    <div className="p-4 space-y-6">
      <Title level={3}>Dashboard</Title>

      {/* Summary Cards */}
      <Row gutter={16}>
        {summaryCards.map((card, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              style={{
                background: card.color,
                color: "#fff",
                borderRadius: 12,
              }}
              bodyStyle={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <div style={{ fontSize: 32 }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: 14 }}>{card.title}</div>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>
                  {card.value}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Area Chart */}
      <Card title="Sales Overview" style={{ borderRadius: 12 }}>
        <Area {...chartConfig} />
      </Card>

      {/* Recent Transactions */}
      <Card title="Recent Transactions" style={{ borderRadius: 12 }}>
        <Table
          dataSource={transactions}
          columns={[
            {
              title: "Customer",
              dataIndex: "customer",
              key: "customer",
            },
            {
              title: "Amount",
              dataIndex: "amount",
              key: "amount",
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status) =>
                status === "Paid" ? (
                  <Tag color="green">Paid</Tag>
                ) : (
                  <Tag color="volcano">Due</Tag>
                ),
            },
          ]}
          pagination={false}
        />
      </Card>

      {/* Shortcuts */}
      <Card style={{ borderRadius: 12 }}>
        <Space>
          <Button type="primary" icon={<PlusCircleOutlined />}>
            New Invoice
          </Button>
          <Button icon={<FileDoneOutlined />}>Reports</Button>
          <Button icon={<UserOutlined />}>Add Customer</Button>
        </Space>
      </Card>
    </div>
  );
};

export default Dashboard;
