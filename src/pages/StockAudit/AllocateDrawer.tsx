import React, { useEffect } from 'react';
import { Form, Button } from 'antd';
import GlobalDrawer from '../../components/antd/GlobalDrawer';
import { allocateDrawerFormItems } from './AllocateDrawerFormItems';
import { InfiniteDropdownResult } from '../../hooks/useInfiniteDropdown';

interface AllocateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  record: any;
  branchDropdown: InfiniteDropdownResult;
  createLoading?: boolean;
}

const AllocateDrawer: React.FC<AllocateDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  record,
  branchDropdown,
  createLoading = false,
}) => {
  const [form] = Form.useForm();
  const formItems = allocateDrawerFormItems(branchDropdown);

  useEffect(() => {
    if (open) {
      form.resetFields();
      // Optionally set initial values from record if needed
    }
  }, [open, form, record]);
  return (
    <GlobalDrawer
      title="Allocate Stock"
      open={open}
      onClose={onClose}
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
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

export default AllocateDrawer;
