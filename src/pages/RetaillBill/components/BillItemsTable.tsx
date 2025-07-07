import React, { useEffect, useRef } from "react";
import { Table, Button, InputNumber, Select, Tooltip } from "antd";
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
  firstTableCellRef?: React.RefObject<any>;
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
  firstTableCellRef,
}) => {
  // Define the editable columns in order
  const editableColumns = ["product", "stock", "qty", "loose_qty", "price"];

  // Create a 2D array of refs: rows x columns
  const inputRefs = useRef<any[][]>([]);
  if (inputRefs.current.length !== dataSource.length) {
    inputRefs.current = dataSource.map(() => editableColumns.map(() => React.createRef()));
  }

  // Helper to focus a cell
  const focusCell = (rowIdx: number, colIdx: number) => {
    const ref = inputRefs.current?.[rowIdx]?.[colIdx];
    if (ref && ref.current) {
      // For Antd Select, focus() is on rc-select instance
      if (ref.current.focus) {
        ref.current.focus();
      } else if (ref.current.input) {
        ref.current.input.focus();
      }
    }
  };

  // Keydown handler for navigation
  const handleCellKeyDown = (rowIdx: number, colIdx: number) => (e: React.KeyboardEvent) => {
    if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      let nextRow = rowIdx;
      let nextCol = colIdx;
      if (e.key === "ArrowRight") {
        if (colIdx < editableColumns.length - 1) {
          nextCol++;
        } else if (rowIdx < dataSource.length - 1) {
          nextCol = 0;
          nextRow++;
        }
      } else if (e.key === "ArrowLeft") {
        if (colIdx > 0) {
          nextCol--;
        } else if (rowIdx > 0) {
          nextCol = editableColumns.length - 1;
          nextRow--;
        }
      } else if (e.key === "ArrowDown") {
        if (rowIdx < dataSource.length - 1) {
          nextRow++;
        }
      } else if (e.key === "ArrowUp") {
        if (rowIdx > 0) {
          nextRow--;
        } else if (rowIdx === 0 && colIdx === 0 && firstTableCellRef && firstTableCellRef.current && firstTableCellRef.current.focusPrev) {
          // Focus Payment Mode if ArrowUp on first cell
          firstTableCellRef.current.focusPrev();
          return;
        }
      }
      focusCell(nextRow, nextCol);
    }
  };

  const columns = [
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Add Item</span>
      ),
      dataIndex: "additem",
      width: 180,
      render: (_: any, record: any, index: number) => {
        // Find the selected stockAudit for the current record
        const selectedStock = stockAuditList?.result?.find(
          (s: any) => s._id === record.stock
        );
        const currentDate = new Date();
        const isStockExpired = selectedStock && new Date(selectedStock.expiry_date) <= currentDate;
        const isStockUnavailable =
          selectedStock &&
          selectedStock.available_quantity === 0 &&
          selectedStock.available_loose_quantity === 0;
        const cannotAdd = isStockUnavailable || isStockExpired;
        
        return (
          <div style={{ display: "flex", gap: 8 }}>
            {dataSource.length > 1 && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record.key)}
              />
            )}
            {index === dataSource.length - 1 &&
              (cannotAdd ? (
                <Tooltip title={isStockExpired ? "Cannot add item: Stock has expired." : "Cannot add item: Stock and loose quantity are both zero."}>
                  <Button
                    type="dashed"
                    disabled
                    style={{
                      borderColor: "#ccc",
                      color: "#ccc",
                      fontWeight: "bold",
                      fontSize: 16,
                      minWidth: 100,
                    }}
                  >
                    + Add
                  </Button>
                </Tooltip>
              ) : (
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
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "#e6f7ff";
                  }}
                  onMouseLeave={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "transparent";
                  }}
                >
                  + Add
                </Button>
              ))}
          </div>
        );
      },
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Item Name</span>
      ),
      dataIndex: "product",
      render: (_: any, record: any, rowIdx: number) => (
        <Select
          ref={rowIdx === 0 ? (el => {
            inputRefs.current[rowIdx][0].current = el;
            if (firstTableCellRef) firstTableCellRef.current = el;
          }) : inputRefs.current[rowIdx][0]}
          value={record.product}
          onChange={(productId) => {
            onChange(productId, record.key, "product");
            onChange(undefined, record.key, "qty");
            onChange(undefined, record.key, "loose_qty");
            onStockAuditFetch(productId);
          }}
          onKeyDown={handleCellKeyDown(rowIdx, 0)}
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
      width: 250,
      render: (_: any, record: any, rowIdx: number) => {
        const currentDate = new Date();
        const validStockAudits = stockAuditList?.result?.filter((stockAudit: any) => {
          const expiryDate = new Date(stockAudit.expiry_date);
          return expiryDate > currentDate;
        }) || [];

        return (
          <Select
            ref={inputRefs.current?.[rowIdx]?.[1]}
            value={record.stock}
            onChange={(value) => onChange(value, record.key, "stock")}
            onKeyDown={handleCellKeyDown(rowIdx, 1)}
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
            {validStockAudits.map((stockAudit: any) => (
              <Select.Option key={stockAudit?._id} value={stockAudit?._id}>
                {`B#${stockAudit.batch_no} | ₹ ${stockAudit.buy_price} | AQ: ${stockAudit.available_quantity} | LQ: ${stockAudit.available_loose_quantity} | Exp: ${new Date(stockAudit.expiry_date).toLocaleDateString()}`}
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: <span style={{ color: "#1890ff", fontWeight: "bold" }}>Qty</span>,
      dataIndex: "qty",
      width: 100,
      render: (_: any, record: any, rowIdx: number) => {
        const selectedStock = stockAuditList?.result?.find(
          (s: any) => s._id === record.stock
        );
        const disableQty =
          selectedStock &&
          selectedStock.available_quantity === 0 &&
          selectedStock.available_loose_quantity >= 0;
        return (
          <InputNumber
            ref={inputRefs.current?.[rowIdx]?.[2]}
            min={0}
            max={selectedStock?.available_quantity}
            value={record.qty}
            onChange={(value) => onChange(value, record.key, "qty")}
            onKeyDown={handleCellKeyDown(rowIdx, 2)}
            style={{ width: "100%" }}
            disabled={disableQty}
          />
        );
      },
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Loose Qty</span>
      ),
      dataIndex: "loose_qty",
      width: 100,
      render: (_: any, record: any, rowIdx: number) => {
        const selectedStock = stockAuditList?.result?.find(
          (s: any) => s._id === record.stock
        );
        const packSize = selectedStock?.ProductItem?.VariantItem?.pack_size;
        const totalLooseAvailable =
          (selectedStock?.available_loose_quantity || 0) +
          (selectedStock?.available_quantity || 0) * packSize;
        const disableLooseQty =
          (selectedStock && selectedStock?.totalLooseAvailable === 0) ||
          (selectedStock?.available_quantity === 0 &&
            selectedStock?.available_loose_quantity === 0);
        return (
          <InputNumber
            ref={inputRefs.current?.[rowIdx]?.[3]}
            min={0}
            max={totalLooseAvailable}
            value={record.loose_qty}
            onChange={(value) => onChange(value, record.key, "loose_qty")}
            onKeyDown={handleCellKeyDown(rowIdx, 3)}
            style={{ width: "100%" }}
            disabled={disableLooseQty}
          />
        );
      },
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Price</span>
      ),
      dataIndex: "price",
      width: 120,
      render: (_: any, record: any, rowIdx: number) => (
        <InputNumber
          ref={inputRefs.current?.[rowIdx]?.[4]}
          min={0}
          value={record.price}
          onChange={(value) => onChange(value, record.key, "price")}
          onKeyDown={handleCellKeyDown(rowIdx, 4)}
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
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        onAdd(); // use the new validated add
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dataSource]);
  
  
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
