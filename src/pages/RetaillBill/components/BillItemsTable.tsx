import React from "react";
import { Table, Button, InputNumber, Select } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

interface BillItemsTableProps {
  dataSource: any[];
  productList: any;
  stockAuditList: any;
  onAdd: () => void;
  onDelete: (key: number) => void;
  onChange: (value: any, key: number, column: string) => void;
  onStockAuditFetch: (productId: string) => void;
  total_amount: number;
  sub_total: number;
  value_of_goods: number;
  total_gst: number;
  discount_value: number;
  isPartiallyPaid: boolean;
  paid_amount: number;
  isGstIncluded: boolean;
  isRetail: boolean;
  discount: number;
  discountType: "percentage" | "amount";
}

const BillItemsTable: React.FC<BillItemsTableProps> = ({
  dataSource,
  productList,
  stockAuditList,
  onAdd,
  onDelete,
  onChange,
  onStockAuditFetch,
  total_amount,
  sub_total,
  value_of_goods,
  total_gst,
  discount_value,
  isPartiallyPaid,
  paid_amount,
  discount,
  discountType,
}) => {
  const columns = [
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Add Item</span>
      ),
      dataIndex: "additem",
      width: 180,
      render: (_: any, record: any, index: number) => (
        <div style={{ display: "flex", gap: 8 }}>
          {dataSource.length > 1 && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record.key)}
            />
          )}
          {index === dataSource.length - 1 && (
            <Button
              type="dashed"
              onClick={onAdd}
              style={{
                borderColor: "#1890ff",
                color: "#1890ff",
                fontWeight: "bold",
                fontSize: 16,
                minWidth: 100,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#e6f7ff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "transparent";
              }}
            >
              + Add
            </Button>
          )}
        </div>
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Item Name</span>
      ),
      dataIndex: "product",
      render: (_: any, record: any) => (
        <Select
          value={record.product}
          onChange={(productId) => {
            onChange(productId, record.key, "product");
            onStockAuditFetch(productId);
          }}
          showSearch
          style={{ width: "100%" }}
          placeholder="Select Product"
          optionFilterProp="children"
          allowClear
          filterOption={(input, option) =>
            String(option?.children)
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
          dropdownStyle={{ maxHeight: 150, overflowY: "auto" }}
        >
          {productList?.result?.map((product: any) => (
            <Select.Option key={product?._id} value={product?._id}>
              {`${product.name} ${product?.VariantItem?.variant_name}`}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Stock</span>
      ),
      dataIndex: "stock",
      width: 180,
      render: (_: any, record: any) => (
        <Select
          value={record.stock}
          onChange={(value) => onChange(value, record.key, "stock")}
          showSearch
          style={{ width: "100%" }}
          placeholder="Select Stock"
          optionFilterProp="children"
          allowClear
          filterOption={(input, option) =>
            String(option?.children)
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
          dropdownStyle={{ maxHeight: 150, overflowY: "auto" }}
        >
          {stockAuditList?.result?.map((stockAudit: any) => (
            <Select.Option key={stockAudit?._id} value={stockAudit?._id}>
              {`${stockAudit.batch_no} - ${stockAudit?.buy_price}`}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: <span style={{ color: "#1890ff", fontWeight: "bold" }}>Qty</span>,
      dataIndex: "qty",
      width: 100,
      render: (_: any, record: any) => (
        <InputNumber
          min={1}
          value={record.qty}
          onChange={(value) => onChange(value, record.key, "qty")}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Loose Qty</span>
      ),
      dataIndex: "loose_qty",
      width: 100,
      render: (_: any, record: any) => (
        <InputNumber
          min={1}
          value={record.loose_qty}
          onChange={(value) => onChange(value, record.key, "loose_qty")}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Price</span>
      ),
      dataIndex: "price",
      width: 120,
      render: (_: any, record: any) => (
        <InputNumber
          min={0}
          value={record.price}
          onChange={(value) => onChange(value, record.key, "price")}
          style={{ width: "100%" }}
          formatter={(value) =>
            `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => Number(value!.replace(/₹\s?|(,*)/g, ""))}
        />
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Amount</span>
      ),
      dataIndex: "amount",
      width: 140,
      render: (_: any, record: any) => (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>
          ₹ {record.amount}
        </span>
      ),
    },
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      pagination={false}
      rowClassName={() => "custom-row"}
      footer={() => (
        <div
          style={{
            textAlign: "right",
            fontWeight: "bold",
            fontSize: 18,
            color: "#1890ff",
            paddingRight: 16,
          }}
        >
          <div>Sub Total: ₹ {Number(sub_total).toFixed(2)}</div>
          <div>Value of Goods: ₹ {Number(value_of_goods).toFixed(2)}</div>
          {discount > 0 && (
            <div>
              Discount:{" "}
              {discountType === "percentage"
                ? `${discount}%`
                : `₹ ${discount_value.toFixed(2)}`}
            </div>
          )}
          <div>GST: ₹ {total_gst.toFixed(2)}</div>
          <div>Net Payable: ₹ {Number(total_amount).toFixed(2)}</div>

          {isPartiallyPaid && (
            <div style={{ fontSize: 14, color: "#52c41a" }}>
              Paid: ₹ {paid_amount || 0}
              <br />
              Remaining: ₹{" "}
              {Number(total_amount - (paid_amount || 0)).toFixed(2)}
            </div>
          )}
        </div>
      )}
      bordered
    />
  );
};

export default BillItemsTable;
