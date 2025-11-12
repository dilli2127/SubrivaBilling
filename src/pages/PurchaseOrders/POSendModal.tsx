import React from 'react';
import { Modal, Form, Input, message, Space, Alert } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useSendPurchaseOrderMutation } from '../../services/redux/api/endpoints';

interface POSendModalProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder: any;
}

const POSendModal: React.FC<POSendModalProps> = ({
  open,
  onClose,
  purchaseOrder,
}) => {
  const [form] = Form.useForm();
  
  const [sendPO, { isLoading }] = useSendPurchaseOrderMutation();
  
  const handleSend = async () => {
    try {
      const values = await form.validateFields();
      await sendPO({
        id: purchaseOrder._id,
        email: values.email,
        message: values.message,
      }).unwrap();
      
      message.success('Purchase order sent to vendor successfully');
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to send PO');
    }
  };
  
  return (
    <Modal
      title={
        <Space>
          <SendOutlined style={{ color: '#1890ff' }} />
          <span>Send Purchase Order to Vendor</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSend}
      confirmLoading={isLoading}
      okText="Send Email"
      width={600}
    >
      <Alert
        message="Email Purchase Order"
        description={`This will send PO #${purchaseOrder?.po_number} as a PDF attachment to the vendor's email address.`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          email: purchaseOrder?.vendor_email || purchaseOrder?.VendorItem?.email,
        }}
      >
        <Form.Item
          name="email"
          label="Vendor Email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email' },
          ]}
        >
          <Input placeholder="vendor@example.com" />
        </Form.Item>
        
        <Form.Item
          name="message"
          label="Message (Optional)"
        >
          <Input.TextArea
            rows={4}
            placeholder="Dear Vendor, Please find the attached purchase order..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default POSendModal;

