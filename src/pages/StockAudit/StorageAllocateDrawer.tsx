import React, { useEffect } from 'react';
import { Form, Button } from 'antd';
import GlobalDrawer from '../../components/antd/GlobalDrawer';
import { storageAllocateDrawerFormItems } from './StorageAllocateDrawerFormItems';

interface StorageAllocateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  record: any;
  rackList: any;
  rackLoading: boolean;
  createLoading?: boolean;
}

const StorageAllocateDrawer: React.FC<StorageAllocateDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  record,
  rackList,
  rackLoading,
  createLoading = false,
}) => {
  const [form] = Form.useForm();
  const formItems = storageAllocateDrawerFormItems(rackList, rackLoading);

  useEffect(() => {
    if (open) {
      form.resetFields();
      // Optionally set initial values from record if needed
    }
  }, [open, form, record]);

  return (
    <GlobalDrawer
      title="Storage Allocate"
      open={open}
      onClose={onClose}
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        // onFinish={onSubmit}
        onFinish={(values) => {
          const payload = {
            ...values,
            stock_audit_id: record?._id,
            rack_available_to_allocate: record?.rack_available_to_allocate,
          };
          onSubmit(payload);
        }}
        initialValues={{}}
      >
        {formItems.map(item => (
          <Form.Item
            key={item.name}
            name={item.name}
            label={item.label}
            rules={item.rules}
          >
            {item.component}
          </Form.Item>
        ))}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            disabled={createLoading}
            loading={createLoading}
          >
            Allocate
          </Button>
        </Form.Item>
      </Form>
    </GlobalDrawer>
  );
};

export default StorageAllocateDrawer; 