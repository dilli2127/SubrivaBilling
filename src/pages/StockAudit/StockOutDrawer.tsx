import React, { useEffect } from "react";
import { Form, Button } from "antd";
import GlobalDrawer from "../../components/antd/GlobalDrawer";
import { stockOutDrawerFormItems } from "./StockOutDrawerFormItems";

interface StockOutDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  record: any;
  loading?: boolean;
}

const StockOutDrawer: React.FC<StockOutDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  record,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const formItems = stockOutDrawerFormItems(record);

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
        {formItems.map(item => (
          <Form.Item
            key={item.name}
            name={item.name}
            label={item.label}
            rules={item.rules}
            initialValue={item.initialValue}
          >
            {item.component}
          </Form.Item>
        ))}
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} disabled={loading}>
            Stockout
          </Button>
        </Form.Item>
      </Form>
    </GlobalDrawer>
  );
};

export default StockOutDrawer; 