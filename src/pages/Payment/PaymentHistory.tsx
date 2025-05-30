import React, { useEffect, useState } from "react";
import { Table, Tag, Select, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

type PaymentStatus = "paid" | "pending" | "failed";

interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  payment_date: string | null;
  payment_method: string;
  transaction_id: string | null;
}

interface Props {
  customerId: string;
}

const statusColor = {
  paid: "green",
  pending: "orange",
  failed: "red",
};

const PaymentHistory: React.FC<Props> = ({ customerId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filtered, setFiltered] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    fetch(`/payments/history/${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setPayments(data);
        setFiltered(data);
      });
  }, [customerId]);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value) {
      setFiltered(payments.filter((p) => p.status === value));
    } else {
      setFiltered(payments);
    }
  };

  const columns: ColumnsType<Payment> = [
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount) => `₹ ${amount.toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: PaymentStatus) => (
        <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "payment_date",
      render: (date) =>
        date ? dayjs(date).format("DD MMM YYYY, hh:mm A") : "-",
    },
    {
      title: "Method",
      dataIndex: "payment_method",
      render: (method) => method || "-",
    },
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      render: (id) => id || "-",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3} style={{ color: "#1890ff", }}>
        Payment History
      </Title>
      <div style={{ marginBottom: 16, justifyContent: "flex-end", display: "flex" }}>
        <Select
          allowClear
          style={{ width: 200 ,}}
          placeholder="Filter by Status"
          onChange={handleFilterChange}
          value={statusFilter}
        >
          <Option value="paid">Paid</Option>
          <Option value="pending">Pending</Option>
          <Option value="failed">Failed</Option>
        </Select>
      </div>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default PaymentHistory;
