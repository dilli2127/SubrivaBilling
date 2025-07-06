import React, { useEffect } from "react";
import { Form, Select, InputNumber, Button } from "antd";
import GlobalDrawer from "../../components/antd/GlobalDrawer";

const { Option } = Select;

interface AllocateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  record: any;
  branchList: any;
  branchLoading: boolean;
}

const AllocateDrawer: React.FC<AllocateDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  record,
  branchList,
  branchLoading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <GlobalDrawer
      title="Allocate Stock"
      open={open}
      onClose={onClose}
      width={400}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="branch_id"
          label="Branch"
          rules={[{ required: true, message: "Please select a branch" }]}
        >
          <Select
            placeholder="Select branch"
            loading={branchLoading}
            showSearch
            optionFilterProp="children"
          >
            {branchList?.result?.map((branch: any) => (
              <Option key={branch._id} value={branch._id}>
                {branch.branch_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="added_quantity"
          label="Quantity"
          rules={[{ required: true, message: "Please enter quantity" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Allocate
          </Button>
        </Form.Item>
      </Form>
    </GlobalDrawer>
  );
};

export default AllocateDrawer; 