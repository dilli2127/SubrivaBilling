import React, { useEffect } from "react";
import { Form, Button } from "antd";
import GlobalDrawer from "../../components/antd/GlobalDrawer";
import { revertDrawerFormItems } from "./RevertDrawerFormItems";

interface RevertDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  record: any;
  branchList: any;
  branchLoading: boolean;
}

const RevertDrawer: React.FC<RevertDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  record,
  branchList,
  branchLoading,
}) => {
  const [form] = Form.useForm();
  const formItems = revertDrawerFormItems(branchList, branchLoading, record);

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form, record]);

  return (
    <GlobalDrawer
      title="Revert Stock"
      open={open}
      onClose={onClose}
      width={400}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{}}>
        {formItems.map(item => (
          <Form.Item key={item.name} name={item.name} label={item.label} rules={item.rules}>
            {item.component}
          </Form.Item>
        ))}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Revert
          </Button>
        </Form.Item>
      </Form>
    </GlobalDrawer>
  );
};

export default RevertDrawer; 