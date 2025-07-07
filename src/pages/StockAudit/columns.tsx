import React from "react";
import { Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { AppstoreAddOutlined, BarcodeOutlined, CalendarOutlined, DollarCircleOutlined, TagsOutlined } from "@ant-design/icons";

export const stockAuditColumns = [
  {
    title: "Invoice ID",
    dataIndex: "invoice_id",
    key: "invoice_id",
    render: (text: string) => (
      <Tag icon={<BarcodeOutlined />} color="blue">
        {text}
      </Tag>
    ),
  },
  {
    title: "Product",
    dataIndex: "ProductItem",
    key: "product",
    render: (product: any) => (
      <Tooltip title={product?.name}>
        <span>
          <TagsOutlined style={{ marginRight: 4 }} />
          {product?.name}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
    render: (qty: number) => (
      <Tag color="green">
        <AppstoreAddOutlined /> {qty}
      </Tag>
    ),
  },
  {
    title: "Available Qty",
    dataIndex: "available_quantity",
    key: "available_quantity",
    render: (qty: number) => (
      <Tag color={qty > 0 ? "green" : "red"}>
        {qty}
      </Tag>
    ),
  },
  {
    title: "Buy Price",
    dataIndex: "buy_price",
    key: "buy_price",
    render: (price: number) => (
      <span>
        <DollarCircleOutlined style={{ marginRight: 4 }} />
        ₹{price}
      </span>
    ),
  },
  {
    title: "Total Cost",
    dataIndex: "total_cost",
    key: "total_cost",
    render: (cost: number) => (
      <span style={{ fontWeight: "bold" }}>
        ₹{cost}
      </span>
    ),
  },
  {
    title: "Buy Date",
    dataIndex: "buyed_date",
    key: "buyed_date",
    render: (date: string) => (
      <span>
        <CalendarOutlined style={{ marginRight: 4 }} />
        {dayjs(date).format("DD/MM/YYYY")}
      </span>
    ),
  },
  {
    title: "Payment Status",
    dataIndex: "payment_status",
    key: "payment_status",
    render: (status: string) => (
      <Tag color={status === "paid" ? "green" : "orange"}>
        {status}
      </Tag>
    ),
  },
]; 