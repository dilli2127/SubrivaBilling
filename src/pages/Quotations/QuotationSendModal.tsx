import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  message,
  Space,
  Tag,
  Alert,
  Descriptions,
  Button,
} from 'antd';
import {
  MailOutlined,
  SendOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useSendQuotationMutation } from '../../services/redux/api/endpoints';

const { TextArea } = Input;

interface QuotationSendModalProps {
  open: boolean;
  onClose: () => void;
  quotation: any;
}

const QuotationSendModal: React.FC<QuotationSendModalProps> = ({
  open,
  onClose,
  quotation,
}) => {
  const [form] = Form.useForm();
  const [sendQuotation, { isLoading }] = useSendQuotationMutation();
  
  // Initialize form when quotation changes
  useEffect(() => {
    if (quotation && open) {
      const customerEmail = quotation.customer?.email || quotation.CustomerItem?.email || quotation.customer_email || '';
      form.setFieldsValue({
        email: customerEmail,
        message: `Dear ${quotation.customer?.full_name || quotation.customer?.name || quotation.customer?.customer_name || quotation.CustomerItem?.customer_name || quotation.CustomerItem?.full_name || quotation.CustomerItem?.name || quotation.customer_name || quotation.full_name || quotation.name || 'Customer'},

Please find attached our quotation ${quotation.quotation_number} for your review.

Quotation Details:
- Quotation Number: ${quotation.quotation_number}
- Valid Until: ${quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : 'N/A'}
- Total Amount: ₹${(quotation.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}

We look forward to your response.

Best regards,
${quotation.CreatedByUser?.username || 'Sales Team'}`,
      });
    }
  }, [quotation, open, form]);
  
  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!quotation?._id) {
        message.error('Quotation not found');
        return;
      }
      
      if (!values.email) {
        message.error('Customer email is required');
        return;
      }
      
      const payload = {
        id: quotation._id,
        email: values.email,
        message: values.message || '',
      };
      
      const result: any = await sendQuotation(payload).unwrap();
      
      if (result?.statusCode === 200 || result?.data) {
        message.success('Quotation sent to customer successfully!');
        form.resetFields();
        onClose();
      } else {
        throw new Error(result?.message || 'Failed to send quotation');
      }
    } catch (error: any) {
      console.error('Send quotation error:', error);
      message.error(error?.data?.message || error?.message || 'Failed to send quotation');
    }
  };
  
  // Handle print
  const handlePrint = () => {
    message.info('Print functionality coming soon');
    // TODO: Implement print functionality
  };
  
  // Handle download PDF
  const handleDownloadPDF = () => {
    message.info('PDF download functionality coming soon');
    // TODO: Implement PDF download
  };
  
  if (!quotation) {
    return null;
  }
  
  const customerEmail = quotation.customer?.email || quotation.CustomerItem?.email || quotation.customer_email || quotation.email || '';
  const customerName = quotation.customer?.full_name || quotation.customer?.name || quotation.customer?.customer_name || quotation.CustomerItem?.customer_name || quotation.CustomerItem?.full_name || quotation.CustomerItem?.name || quotation.customer_name || quotation.full_name || quotation.name || 'Customer';
  
  return (
    <Modal
      title={
        <Space>
          <MailOutlined />
          <span>Send Quotation to Customer</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      width={700}
      okText="Send Email"
      cancelText="Cancel"
      footer={[
        <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
          Print
        </Button>,
        <Button key="pdf" icon={<DownloadOutlined />} onClick={handleDownloadPDF}>
          Download PDF
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="send" type="primary" icon={<SendOutlined />} loading={isLoading} onClick={handleSubmit}>
          Send Email
        </Button>,
      ]}
    >
      <Alert
        message="Sending Quotation"
        description={`This will send quotation ${quotation.quotation_number} to the customer via email. The quotation status will be updated to 'sent'.`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      {/* Quotation Summary */}
      <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Quotation Number">
          <Tag color="blue">{quotation.quotation_number}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Customer">
          {customerName}
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          <strong style={{ color: '#52c41a' }}>
            ₹{(quotation.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Valid Until">
          {quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : '-'}
        </Descriptions.Item>
      </Descriptions>
      
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="email"
          label="Customer Email"
          rules={[
            { required: true, message: 'Customer email is required' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="customer@example.com"
          />
        </Form.Item>
        
        <Form.Item
          name="message"
          label="Email Message"
          rules={[{ required: true, message: 'Email message is required' }]}
        >
          <TextArea
            rows={8}
            placeholder="Enter email message to customer..."
          />
        </Form.Item>
      </Form>
      
      <Alert
        message="Note"
        description="The quotation PDF will be attached automatically to the email. Make sure the customer email is correct before sending."
        type="warning"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default QuotationSendModal;

