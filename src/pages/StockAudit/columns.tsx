import React from "react";
import { Tag, Tooltip, Button, Space } from "antd";
import dayjs from "dayjs";
import { 
  AppstoreAddOutlined, 
  BarcodeOutlined, 
  CalendarOutlined, 
  DollarCircleOutlined, 
  TagsOutlined,
  ShopOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RollbackOutlined,
  ExportOutlined
} from "@ant-design/icons";

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
    title: "Vendor",
    dataIndex: "VendorItem",
    key: "vendor",
    render: (vendor: any) => (
      <Tooltip title={vendor?.vendor_name}>
        <span>
          <UserOutlined style={{ marginRight: 4 }} />
          {vendor?.vendor_name || "-"}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "Warehouse",
    dataIndex: "WarehouseItem",
    key: "warehouse",
    render: (warehouse: any) => (
      <Tooltip title={warehouse?.warehouse_name}>
        <span>
          <ShopOutlined style={{ marginRight: 4 }} />
          {warehouse?.warehouse_name || "-"}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "Batch Number",
    dataIndex: "batch_no",
    key: "batch_no",
    render: (batchNo: string) => (
      <Tag icon={<SafetyCertificateOutlined />} color="purple">
        {batchNo || "-"}
      </Tag>
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
    title: "Selling Price",
    dataIndex: "sell_price",
    key: "sell_price",
    render: (price: number) => (
      <span>
        <DollarOutlined style={{ marginRight: 4 }} />
        ₹{price || "-"}
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
    title: "MFG Date",
    dataIndex: "mfg_date",
    key: "mfg_date",
    render: (date: string) => (
      <span>
        <ClockCircleOutlined style={{ marginRight: 4 }} />
        {date ? dayjs(date).format("DD/MM/YYYY") : "-"}
      </span>
    ),
  },
  {
    title: "Expiry Date",
    dataIndex: "expiry_date",
    key: "expiry_date",
    render: (date: string) => {
      const expiryDate = dayjs(date);
      const today = dayjs();
      const isExpired = expiryDate.isBefore(today);
      const isNearExpiry = expiryDate.diff(today, 'days') <= 30 && expiryDate.diff(today, 'days') > 0;
      
      let color = "green";
      if (isExpired) color = "red";
      else if (isNearExpiry) color = "orange";
      
      return (
        <Tag color={color}>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {date ? dayjs(date).format("DD/MM/YYYY") : "-"}
        </Tag>
      );
    },
  },
  {
    title: "Payment Status",
    dataIndex: "payment_status",
    key: "payment_status",
    render: (status: string) => (
      <Tag color={status === "paid" ? "green" : status === "partial" ? "orange" : "red"}>
        {status}
      </Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string, record: any) => {
      const availableQty = record.available_quantity || 0;
      const expiryDate = record.expiry_date ? dayjs(record.expiry_date) : null;
      const today = dayjs();
      
      let statusText = "Active";
      let color = "green";
      let icon = <CheckCircleOutlined />;
      
      if (availableQty === 0) {
        statusText = "Out of Stock";
        color = "red";
        icon = <ExclamationCircleOutlined />;
      } else if (expiryDate && expiryDate.isBefore(today)) {
        statusText = "Expired";
        color = "red";
        icon = <ExclamationCircleOutlined />;
      } else if (expiryDate && expiryDate.diff(today, 'days') <= 30) {
        statusText = "Near Expiry";
        color = "orange";
        icon = <ExclamationCircleOutlined />;
      }
      
      return (
        <Tag color={color} icon={icon}>
          {statusText}
        </Tag>
      );
    },
  },
  {
    title: "Stock Handle",
    key: "stock_handle",
    width: 200,
    render: (text: any, record: any) => {
      const availableQty = record.available_quantity || 0;
      const isOutOfStock = availableQty === 0;
      
      return (
        <Space size="small">
          <Tooltip title="Allocate Stock">
            <Button
              type="primary"
              size="small"
              icon={<AppstoreAddOutlined />}
              onClick={() => handleAllocate(record)}
              disabled={isOutOfStock}
              style={{ 
                fontSize: '10px',
                height: '24px',
                padding: '0 6px'
              }}
            >
              Allocate
            </Button>
          </Tooltip>
          
          <Tooltip title="Revert Changes">
            <Button
              type="default"
              size="small"
              icon={<RollbackOutlined />}
              onClick={() => handleRevert(record)}
              style={{ 
                fontSize: '10px',
                height: '24px',
                padding: '0 6px'
              }}
            >
              Revert
            </Button>
          </Tooltip>
          
          <Tooltip title="Mark as Stockout">
            <Button
              type="default"
              size="small"
              icon={<ExportOutlined />}
              onClick={() => handleStockout(record)}
              style={{ 
                fontSize: '10px',
                height: '24px',
                padding: '0 6px'
              }}
            >
              Stockout
            </Button>
          </Tooltip>
        </Space>
      );
    },
  },
];

// Action handlers - these will be implemented in the parent component
export const handleAllocate = (record: any) => {
  console.log("Allocate clicked for record:", record);
  // TODO: Implement allocate logic
  // This could open a modal to select allocation details
};

export const handleRevert = (record: any) => {
  console.log("Revert clicked for record:", record);
  // TODO: Implement revert logic
  // This could revert the last changes for this record
};

export const handleStockout = (record: any) => {
  console.log("Stockout clicked for record:", record);
  // TODO: Implement stockout logic
  // This could mark the item as out of stock
}; 