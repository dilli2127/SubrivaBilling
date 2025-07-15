import { Select, InputNumber, DatePicker, Input } from "antd";

const { Option } = Select;

export const stockOutDrawerFormItems = (
  record: any
) => [
  {
    name: "stock_audit_id",
    label: "Stock In Batch",
    rules: [{ required: true, message: "Please select the stock batch" }],
    initialValue: record?._id,
    component: (
      <Select disabled>
        <Option value={record?._id}>
          {record?.ProductItem?.name} - {record?.ProductItem?.VariantItem?.variant_name} - {record?.batch_no}
        </Option>
      </Select>
    ),
  },
  {
    name: "quantity",
    label: "Quantity",
    rules: [{ required: true, message: "Enter quantity to remove" }],
    component: <InputNumber min={1} placeholder="e.g., 5" style={{ width: "100%" }} />,
  },
  {
    name: "out_reason",
    label: "Reason",
    rules: [{ required: true, message: "Please enter the reason" }],
    component: (
      <Select placeholder="Reason for stock out">
        <Select.Option value="expired">Expired</Select.Option>
        <Select.Option value="damaged">Damaged</Select.Option>
        <Select.Option value="internal_use">Internal Use</Select.Option>
        <Select.Option value="bulk_sale">Bulk Sale</Select.Option>
        <Select.Option value="return_to_vendor">Return to Vendor</Select.Option>
      </Select>
    ),
  },
  {
    name: "out_date",
    label: "Out Date",
    rules: [{ required: true, message: "Please select the date" }],
    component: <DatePicker placeholder="Select Date" style={{ width: "100%" }} />,
  },
  {
    name: "note",
    label: "Note",
    rules: [],
    component: <Input.TextArea rows={3} placeholder="Optional note" />,
  },
]; 