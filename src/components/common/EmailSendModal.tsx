import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Typography, Divider, Alert, Spin, message } from 'antd';
import { 
  MailOutlined, 
  SendOutlined, 
  EyeOutlined, 
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useApiActions } from '../../services/api/useApiActions';
import styles from './EmailSendModal.module.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface EmailSendModalProps {
  visible: boolean;
  onClose: () => void;
  billData?: any;
  customerEmail?: string;
  customerName?: string;
}

interface EmailPreview {
  subject: string;
  text: string;
  html: string;
}

const EmailSendModal: React.FC<EmailSendModalProps> = ({
  visible,
  onClose,
  billData,
  customerEmail,
  customerName
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [emailPreview, setEmailPreview] = useState<EmailPreview | null>(null);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  
  const { getEntityApi } = useApiActions();

  // Initialize form with customer email
  useEffect(() => {
    if (visible && customerEmail) {
      form.setFieldsValue({
        to: customerEmail,
        subject: `Invoice #${billData?.invoice_no || ''} - ${customerName || ''}`
      });
    }
  }, [visible, customerEmail, customerName, billData, form]);

  // Generate email preview
  const generatePreview = async () => {
    if (!billData) return;

    setLoading(true);
    try {
      // Simulate generating email preview (you can replace this with actual API call)
      const preview: EmailPreview = {
        subject: `Invoice #${billData.invoice_no} - ${billData.customerDetails?.full_name || 'Customer'}`,
        text: generateInvoiceText(billData),
        html: generateInvoiceHTML(billData)
      };
      
      setEmailPreview(preview);
      setPreviewMode(true);
      form.setFieldsValue({ subject: preview.subject });
    } catch (error) {
      message.error('Failed to generate email preview');
    } finally {
      setLoading(false);
    }
  };

  // Generate invoice text content
  const generateInvoiceText = (invoiceData: any) => {
    return `
Dear ${invoiceData.customerDetails?.full_name || 'Valued Customer'},

Thank you for your business! Please find your invoice details below:

Invoice Number: ${invoiceData.invoice_no}
Date: ${new Date(invoiceData.date).toLocaleDateString()}
Total Amount: ₹${invoiceData.total_amount || 0}

Items:
${invoiceData.Items?.map((item: any) => 
  `- ${item.productItems?.name} (${item.qty} x ₹${item.price}) = ₹${item.amount}`
).join('\n') || 'No items'}

Payment Status: ${invoiceData.is_paid ? 'Paid' : 'Pending'}

Thank you for choosing us!

Best regards,
Subriva Billing Team
    `.trim();
  };

  // Generate invoice HTML content
  const generateInvoiceHTML = (invoiceData: any) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .invoice-table th { background-color: #f8f9fa; }
            .total { font-weight: bold; font-size: 18px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Subriva Billing</h1>
            <h2>Invoice #${invoiceData.invoice_no}</h2>
        </div>
        
        <div class="content">
            <p>Dear <strong>${invoiceData.customerDetails?.full_name || 'Valued Customer'}</strong>,</p>
            
            <p>Thank you for your business! Please find your invoice details below:</p>
            
            <table class="invoice-table">
                <tr>
                    <th>Invoice Number</th>
                    <td>${invoiceData.invoice_no}</td>
                </tr>
                <tr>
                    <th>Date</th>
                    <td>${new Date(invoiceData.date).toLocaleDateString()}</td>
                </tr>
                <tr>
                    <th>Customer</th>
                    <td>${invoiceData.customerDetails?.full_name || 'N/A'}</td>
                </tr>
            </table>
            
            <h3>Items:</h3>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceData.Items?.map((item: any) => `
                        <tr>
                            <td>${item.productItems?.name || 'N/A'}</td>
                            <td>${item.qty || 0}</td>
                            <td>₹${item.price || 0}</td>
                            <td>₹${item.amount || 0}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="4">No items</td></tr>'}
                </tbody>
                <tfoot>
                    <tr class="total">
                        <td colspan="3">Total Amount</td>
                        <td>₹${invoiceData.total_amount || 0}</td>
                    </tr>
                </tfoot>
            </table>
            
            <p><strong>Payment Status:</strong> ${invoiceData.is_paid ? 'Paid' : 'Pending'}</p>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing us!</p>
            <p><strong>Best regards,<br>Subriva Billing Team</strong></p>
        </div>
    </body>
    </html>
    `;
  };

  // Handle email sending
  const handleSendEmail = async (values: any) => {
    if (!billData) {
      message.error('No bill data available');
      return;
    }

    setSending(true);
    try {
      // Call your backend API
      const response = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: values.to,
          invoiceData: billData,
          subject: values.subject,
          customMessage: values.message || ''
        })
      });

      const result = await response.json();

      if (result.success) {
        setSendSuccess(true);
        message.success(`Invoice sent successfully to ${values.to}`);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        message.error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      message.error('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    form.validateFields().then(handleSendEmail);
  };

  // Reset modal state when closing
  const handleClose = () => {
    form.resetFields();
    setPreviewMode(false);
    setEmailPreview(null);
    setSendSuccess(false);
    onClose();
  };

  return (
    <Modal
      title={
        <div className={styles.emailSendHeader}>
          <MailOutlined />
          <span>Send Invoice via Email</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={900}
      className={styles.emailSendModal}
      footer={null}
      destroyOnClose
    >
      <div className={styles.emailSendContent}>
        {sendSuccess ? (
          // Success State
          <div className={styles.successState}>
            <CheckCircleOutlined className={styles.successIcon} />
            <Title level={3}>Email Sent Successfully!</Title>
            <Text type="secondary">
              The invoice has been sent to {form.getFieldValue('to')}
            </Text>
          </div>
        ) : (
          <>
            {/* Email Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className={styles.emailForm}
            >
                <div className={styles.formSection}>
                <Title level={4}>Email Details</Title>
                
                <Form.Item
                  label="To"
                  name="to"
                  rules={[
                    { required: true, message: 'Please enter recipient email' },
                    { type: 'email', message: 'Please enter valid email address' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="customer@example.com"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Subject"
                  name="subject"
                  rules={[{ required: true, message: 'Please enter email subject' }]}
                >
                  <Input
                    placeholder="Invoice subject"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Custom Message (Optional)"
                  name="message"
                >
                  <TextArea
                    rows={3}
                    placeholder="Add a personal message to the customer..."
                  />
                </Form.Item>
              </div>

              <Divider />

              {/* Actions */}
              <div className={styles.formActions}>
                <Space>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={generatePreview}
                    loading={loading}
                    disabled={!billData}
                  >
                    Preview Email
                  </Button>
                  
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    htmlType="submit"
                    loading={sending}
                    disabled={!billData}
                  >
                    Send Email
                  </Button>
                  
                  <Button onClick={handleClose}>
                    Cancel
                  </Button>
                </Space>
              </div>
            </Form>

            {/* Email Preview */}
            {previewMode && emailPreview && (
              <div className={styles.emailPreview}>
                <Divider>Email Preview</Divider>
                <div className={styles.previewContent}>
                  <div className={styles.previewHeader}>
                    <Title level={5}>Subject: {emailPreview.subject}</Title>
                  </div>
                  
                  <div className={styles.previewBody}>
                    <div 
                      className={styles.htmlPreview}
                      dangerouslySetInnerHTML={{ __html: emailPreview.html }}
                    />
                  </div>
                  
                  <div className={styles.previewActions}>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSubmit}
                      loading={sending}
                    >
                      Send This Email
                    </Button>
                    <Button onClick={() => setPreviewMode(false)}>
                      Back to Edit
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Bill Info */}
            {billData && (
              <div className={styles.billInfo}>
                <Alert
                  message="Invoice Information"
                  description={
                    <div>
                      <Text strong>Invoice #:</Text> {billData.invoice_no}<br />
                      <Text strong>Customer:</Text> {billData.customerDetails?.full_name || 'N/A'}<br />
                      <Text strong>Amount:</Text> ₹{billData.total_amount || 0}
                    </div>
                  }
                  type="info"
                  showIcon
                />
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default EmailSendModal;
