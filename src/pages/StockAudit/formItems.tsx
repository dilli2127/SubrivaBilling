import React from "react";
import { DatePicker, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import { InfiniteDropdownResult } from "../../hooks/useInfiniteDropdown";

const { Option } = Select;

interface StockAuditFormParams {
  productDropdown: InfiniteDropdownResult;
  vendorDropdown: InfiniteDropdownResult;
  warehouseDropdown: InfiniteDropdownResult;
}

export const getStockAuditFormItems = ({
  productDropdown,
  vendorDropdown,
  warehouseDropdown,
}: StockAuditFormParams) => [
  {
    label: "Invoice / Reference ID",
    name: "invoice_id",
    rules: [{ required: true, message: "Enter invoice or reference ID!" }],
    component: <Input placeholder="e.g., INV-1001" />,
  },
  {
    label: "Product",
    name: "product",
    rules: [{ required: true, message: "Please select a product!" }],
    component: (
      <Select
        placeholder="Select product"
        showSearch
        allowClear
        loading={productDropdown.loading && productDropdown.items.length === 0}
        onSearch={productDropdown.setSearchString}
        onPopupScroll={productDropdown.handlePopupScroll}
        onDropdownVisibleChange={productDropdown.onDropdownVisibleChange}
        filterOption={false}
        notFoundContent={
          productDropdown.loading ? 'Loading products...' : 
          productDropdown.items.length === 0 ? 'No products found. Add products first.' : 
          null
        }
        dropdownRender={(menu) => (
          <>
            {menu}
            {productDropdown.hasMore && productDropdown.items.length > 0 && (
              <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                {productDropdown.loading ? 'Loading...' : 'Scroll for more'}
              </div>
            )}
          </>
        )}
      >
        {productDropdown.items.map((product: any) => (
          <Select.Option key={product._id} value={product._id}>
            {`${product.name} ${product?.VariantItem?.variant_name || ''}`}
          </Select.Option>
        ))}
      </Select>
    ),
  },
  {
    label: "Quantity",
    name: "quantity",
    rules: [{ required: true, message: "Enter quantity!" }],
    component: (
      <InputNumber min={1} placeholder="e.g., 10" style={{ width: "100%" }} />
    ),
  },
  {
    label: "Buying Price (per unit)",
    name: "buy_price",
    rules: [{ required: true, message: "Enter buying price!" }],
    component: (
      <InputNumber
        min={0}
        step={0.01}
        placeholder="₹0.00"
        style={{ width: "100%" }}
      />
    ),
  },
  {
    label: "MRP (per unit)",
    name: "mrp",
    rules: [{ required: true, message: "Enter buying price!" }],
    component: (
      <InputNumber
        min={0}
        step={0.01}
        placeholder="₹0.00"
        style={{ width: "100%" }}
      />
    ),
  },
  {
    label: "Selling Price",
    name: "sell_price",
    rules: [],
    component: (
      <InputNumber
        min={0}
        step={0.01}
        placeholder="₹0.00"
        style={{ width: "100%" }}
      />
    ),
  },
  {
    label: "Batch Number",
    name: "batch_no",
    rules: [],
    component: <Input placeholder="Optional batch number" />,
  },
  {
    label: "Manufacturing Date",
    name: "mfg_date",
    rules: [],
    component: <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />,
  },
  {
    label: "Expiry Date",
    name: "expiry_date",
    rules: [
      {
        required: true,
        message: "Enter expiry date!",
      },
      ({ getFieldValue }: { getFieldValue: (name: string) => any }) => ({
        validator(_: any, value: any) {
          const mfg = getFieldValue("mfg_date");
          if (mfg && value && value.isBefore(mfg)) {
            return Promise.reject(new Error("Expiry must be after MFG date"));
          }
          return Promise.resolve();
        },
      }),
    ],
    component: <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />,
  },
  {
    label: "Vendor",
    name: "vendor",
    rules: [{
      required: true,
      message: "Select vendor!",
    }],
    component: (
      <Select
        placeholder="Select Vendor"
        showSearch
        allowClear
        loading={vendorDropdown.loading && vendorDropdown.items.length === 0}
        onSearch={vendorDropdown.setSearchString}
        onPopupScroll={vendorDropdown.handlePopupScroll}
        onDropdownVisibleChange={vendorDropdown.onDropdownVisibleChange}
        filterOption={false}
        notFoundContent={
          vendorDropdown.loading ? 'Loading vendors...' : 
          vendorDropdown.items.length === 0 ? 'No vendors found. Add vendors first.' : 
          null
        }
        dropdownRender={(menu) => (
          <>
            {menu}
            {vendorDropdown.hasMore && vendorDropdown.items.length > 0 && (
              <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                {vendorDropdown.loading ? 'Loading...' : 'Scroll for more'}
              </div>
            )}
          </>
        )}
      >
        {vendorDropdown.items.map((vendor: any) => (
          <Select.Option key={vendor._id} value={vendor._id}>
            {`${vendor.vendor_name} ${vendor?.company_name || ''}`}
          </Select.Option>
        ))}
      </Select>
    ),
  },
  {
    label: "Buyed Date",
    name: "buyed_date",
    initialValue: dayjs(), // default to today
    rules: [{ required: true, message: "Select the buyed date" }],
    component: <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />,
  },
  {
    label: "Payment Status",
    name: "payment_status",
    rules: [{ required: true, message: "Select payment status!" }],
    component: (
      <Select placeholder="Select payment status">
        <Option value="paid">Paid</Option>
        <Option value="pending">Pending</Option>
        <Option value="partial">Partial</Option>
      </Select>
    ),
  },
  {
    label: "Warehouse / Location",
    name: "warehouse_location",
    rules: [],
    component: (
      <Select
        placeholder="Select warehouse"
        showSearch
        allowClear
        loading={warehouseDropdown.loading && warehouseDropdown.items.length === 0}
        onSearch={warehouseDropdown.setSearchString}
        onPopupScroll={warehouseDropdown.handlePopupScroll}
        onDropdownVisibleChange={warehouseDropdown.onDropdownVisibleChange}
        filterOption={false}
        notFoundContent={
          warehouseDropdown.loading ? 'Loading warehouses...' : 
          warehouseDropdown.items.length === 0 ? 'No warehouses found' : 
          null
        }
        dropdownRender={(menu) => (
          <>
            {menu}
            {warehouseDropdown.hasMore && warehouseDropdown.items.length > 0 && (
              <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                {warehouseDropdown.loading ? 'Loading...' : 'Scroll for more'}
              </div>
            )}
          </>
        )}
      >
        {warehouseDropdown.items.map((warehouse: any) => (
          <Select.Option key={warehouse._id} value={warehouse._id}>
            {`${warehouse.warehouse_name} ${warehouse?.warehouse_code || ''}`}
          </Select.Option>
        ))}
      </Select>
    ),
  },
  {
    label: "Note",
    name: "note",
    rules: [],
    component: <Input.TextArea rows={2} placeholder="Optional remarks" />,
  },
  {
    label: "Total Cost",
    name: "total_cost",
    rules: [],
    component: (
      <InputNumber
        placeholder="Auto-calculated"
        disabled
        style={{ width: "100%" }}
      />
    ),
  },
]; 