import React, { useEffect } from "react";
import { Form, InputNumber, Button, Select, DatePicker, Input } from "antd";
import GlobalDrawer from "../../components/antd/GlobalDrawer";

const { Option } = Select;

interface StockOutDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  record: any;
}

const StockOutDrawer: React.FC<StockOutDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  record,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <GlobalDrawer
      title="Stock Out"
      open={open}
      onClose={onClose}
      width={400}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="Stock In Batch"
          name="stock_audit_id"
          initialValue={record?._id}
          rules={[{ required: true, message: "Please select the stock batch" }]}
        >
          <Select disabled>
            <Option value={record?._id}>
              {record?.ProductItem?.name} - {record?.ProductItem?.VariantItem?.variant_name} - {record?.batch_no}
            </Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Quantity"
          name="quantity"
          rules={[{ required: true, message: "Enter quantity to remove" }]}
        >
          <InputNumber min={1} placeholder="e.g., 5" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Reason"
          name="out_reason"
          rules={[{ required: true, message: "Please enter the reason" }]}
        >
          <Select placeholder="Reason for stock out">
            <Select.Option value="expired">Expired</Select.Option>
            <Select.Option value="damaged">Damaged</Select.Option>
            <Select.Option value="internal_use">Internal Use</Select.Option>
            <Select.Option value="bulk_sale">Bulk Sale</Select.Option>
            <Select.Option value="return_to_vendor">Return to Vendor</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Out Date"
          name="out_date"
          rules={[{ required: true, message: "Please select the date" }]}
        >
          <DatePicker placeholder="Select Date" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Note"
          name="note"
          rules={[]}
        >
          <Input.TextArea rows={3} placeholder="Optional note" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Stockout
          </Button>
        </Form.Item>
      </Form>
    </GlobalDrawer>
  );
};

export default StockOutDrawer; 