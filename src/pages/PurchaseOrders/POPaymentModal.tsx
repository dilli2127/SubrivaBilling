import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Space,
  Typography,
  Divider,
  Alert,
  Button,
  Row,
  Col,
} from 'antd';
import {
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useCreatePOPaymentMutation } from '../../services/redux/api/endpoints/purchaseOrder.endpoints';
import { getCurrentUser } from '../../helpers/auth';
import SessionStorageEncryption from '../../helpers/encryption';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface POPaymentModalProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder: any;
  onSuccess?: () => void;
}

const POPaymentModal: React.FC<POPaymentModalProps> = ({
  open,
  onClose,
  purchaseOrder,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [createPayment, { isLoading }] = useCreatePOPaymentMutation();
  const [paymentMode, setPaymentMode] = useState<string>('cash');
  const currentUser = getCurrentUser();
  
  // Safely convert amounts to numbers
  const totalAmount = Number(purchaseOrder?.total_amount) || 0;
  const paidAmount = Number(purchaseOrder?.paid_amount) || 0;
  const calculatedOutstanding = Math.max(0, totalAmount - paidAmount);
  
  // Use outstanding_amount from PO if available and valid, otherwise calculate it
  const outstandingAmountFromPO = purchaseOrder?.outstanding_amount !== undefined && purchaseOrder?.outstanding_amount !== null
    ? Number(purchaseOrder.outstanding_amount)
    : null;
  
  // Ensure outstandingAmount is always a valid number (use PO value if valid, otherwise calculated)
  const numOutstandingAmount = outstandingAmountFromPO !== null && !isNaN(outstandingAmountFromPO)
    ? Math.max(0, outstandingAmountFromPO)
    : calculatedOutstanding;
  
  // Get multi-tenant fields from purchase order or user context
  const scopeData = SessionStorageEncryption.getItem('scope');
  const organisationId = purchaseOrder?.organisation_id || currentUser?.organisation_id || scopeData?.organisationId;
  const branchId = purchaseOrder?.branch_id || currentUser?.branch_id || scopeData?.branchId;
  const tenantId = purchaseOrder?.tenant_id || scopeData?.tenantId;
  
  useEffect(() => {
    if (open && purchaseOrder) {
      // Don't auto-fill amount - let user enter partial payment amount
      form.setFieldsValue({
        payment_date: dayjs(),
        payment_amount: undefined, // Don't pre-fill - allow user to enter partial amount
        payment_mode: 'bank_transfer',
        transaction_id: undefined,
        cheque_number: undefined,
        bank_name: undefined,
        reference_number: undefined,
      });
      setPaymentMode('bank_transfer');
    }
  }, [open, purchaseOrder, form]);
  
  // Helper function to set partial payment amount
  const setPartialAmount = (percentage: number) => {
    const amount = (numOutstandingAmount * percentage) / 100;
    form.setFieldsValue({ payment_amount: Number(amount.toFixed(2)) });
  };
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate payment amount
      if (values.payment_amount <= 0) {
        message.error('Payment amount must be greater than 0');
        return;
      }
      
      if (values.payment_amount > numOutstandingAmount) {
        message.error(`Payment amount cannot exceed outstanding amount of ₹${numOutstandingAmount.toFixed(2)}`);
        return;
      }
      
      // Validate PO status - payments allowed only for sent, confirmed, partially_received, fully_received, or closed
      const allowedStatuses = ['sent', 'confirmed', 'partially_received', 'fully_received', 'closed'];
      const currentStatus = purchaseOrder?.status;
      
      if (!allowedStatuses.includes(currentStatus)) {
        message.error(`Payments cannot be recorded for PO in "${currentStatus}" status. PO must be sent to vendor first.`);
        return;
      }
      
      // Validate multi-tenant fields
      if (!organisationId || !tenantId) {
        message.error('Organisation and Tenant information is required');
        return;
      }
      
      // Determine payment type (advance or normal)
      const isAdvancePayment = ['sent', 'confirmed'].includes(currentStatus) && 
                                (!purchaseOrder?.is_partially_received && !purchaseOrder?.is_fully_received);
      
      // Validate purchase order ID
      if (!purchaseOrder?._id) {
        message.error('Purchase Order ID is missing');
        return;
      }
      
      const poId = purchaseOrder._id;
      
      // Build payload according to backend model
      // Note: purchase_order_id will be extracted from payload and used in URL path
      const payload: any = {
        purchase_order_id: poId, // This will be extracted and used in URL: /purchase_orders/{poId}/payments
        payment_date: values.payment_date.format('YYYY-MM-DD'),
        payment_amount: values.payment_amount,
        payment_mode: values.payment_mode,
        organisation_id: organisationId,
        tenant_id: tenantId,
        notes: values.notes || undefined,
        paid_by_id: currentUser?._id || undefined,
        paid_by_name: currentUser?.username || currentUser?.name || undefined,
      };
      
      // Add branch_id if available
      if (branchId) {
        payload.branch_id = branchId;
      }
      
      // Map payment reference fields based on payment mode
      if (values.payment_mode === 'cheque') {
        if (values.cheque_number) payload.cheque_number = values.cheque_number;
        if (values.bank_name) payload.bank_name = values.bank_name;
      } else if (['upi', 'card', 'bank_transfer'].includes(values.payment_mode)) {
        if (values.transaction_id) payload.transaction_id = values.transaction_id;
        if (values.bank_name && values.payment_mode === 'bank_transfer') {
          payload.bank_name = values.bank_name;
        }
      }
      
      // Add reference number if provided
      if (values.reference_number) {
        payload.reference_number = values.reference_number;
      }
      
      await createPayment(payload).unwrap();
      
      // Show appropriate success message based on payment amount and type
      const remainingAmount = numOutstandingAmount - values.payment_amount;
      const paymentType = isAdvancePayment ? 'Advance ' : '';
      
      if (remainingAmount > 0) {
        message.success(
          `${paymentType}Payment of ₹${values.payment_amount.toFixed(2)} recorded successfully! Remaining amount: ₹${remainingAmount.toFixed(2)}`,
          5
        );
      } else {
        message.success(`${paymentType}Payment recorded successfully! Purchase order is now fully paid.`, 5);
      }
      
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Payment creation error:', error);
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || 'Failed to record payment';
      message.error(errorMessage);
    }
  };
  
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };
  
  return (
    <Modal
      title={
        <Space>
          <DollarOutlined style={{ color: '#52c41a' }} />
          <span>Record Payment</span>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Space key="footer" style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isLoading}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Record Payment
          </Button>
        </Space>
      ]}
    >
      <Alert
        message="Payment Information"
        description={
          <div>
            <div><strong>PO Number:</strong> {purchaseOrder?.po_number || 'N/A'}</div>
            {numOutstandingAmount > 0 && (
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                💡 You can record partial payments. Multiple payments can be made until the full amount is paid.
              </div>
            )}
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      {/* Payment Summary */}
      <div style={{ 
        background: '#f6f8fa', 
        padding: 16, 
        borderRadius: 8, 
        marginBottom: 16 
      }}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>Total Amount:</Text>
            <Text strong>₹{(Number(totalAmount) || 0).toLocaleString('en-IN', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Paid Amount:</Text>
            <Text style={{ color: '#52c41a' }}>
              ₹{(Number(paidAmount) || 0).toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </Text>
          </div>
          {paidAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
              <Text>Payment Progress:</Text>
              <Text>
                {((Number(paidAmount) / Number(totalAmount)) * 100).toFixed(1)}%
              </Text>
            </div>
          )}
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>Outstanding Amount:</Text>
            <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
              ₹{numOutstandingAmount.toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </Text>
          </div>
        </Space>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="payment_date"
              label={
                <Space>
                  <CalendarOutlined />
                  <span>Payment Date</span>
                </Space>
              }
              rules={[{ required: true, message: 'Please select payment date' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="payment_amount"
              label={
                <Space>
                  <DollarOutlined />
                  <span>Payment Amount</span>
                  <span style={{ color: 'red' }}>*</span>
                </Space>
              }
              extra={
                numOutstandingAmount > 0 ? (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
                      Quick amount selection (partial payments allowed):
                    </Text>
                    <Space size="small" wrap>
                      <Button 
                        size="small" 
                        type="link" 
                        onClick={() => setPartialAmount(25)}
                        style={{ padding: '0 8px', fontSize: '12px' }}
                      >
                        25%
                      </Button>
                      <Button 
                        size="small" 
                        type="link" 
                        onClick={() => setPartialAmount(50)}
                        style={{ padding: '0 8px', fontSize: '12px' }}
                      >
                        50%
                      </Button>
                      <Button 
                        size="small" 
                        type="link" 
                        onClick={() => setPartialAmount(75)}
                        style={{ padding: '0 8px', fontSize: '12px' }}
                      >
                        75%
                      </Button>
                      <Button 
                        size="small" 
                        type="link" 
                        onClick={() => setPartialAmount(100)}
                        style={{ padding: '0 8px', fontSize: '12px', color: '#52c41a' }}
                      >
                        Full (₹{numOutstandingAmount.toFixed(2)})
                      </Button>
                    </Space>
                  </div>
                ) : (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Enter payment amount (max: ₹{numOutstandingAmount.toFixed(2)})
                  </Text>
                )
              }
              rules={[
                { required: true, message: 'Please enter payment amount' },
                { type: 'number', min: 0.01, message: 'Amount must be greater than 0' },
                {
                  validator: (_, value) => {
                    if (value && value > numOutstandingAmount) {
                      return Promise.reject(new Error(`Amount cannot exceed outstanding amount of ₹${numOutstandingAmount.toFixed(2)}`));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                prefix="₹"
                placeholder={`Enter amount (max: ₹${numOutstandingAmount.toFixed(2)})`}
                min={0.01}
                max={numOutstandingAmount}
                step={0.01}
                precision={2}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                  const parsed = value?.replace(/\$\s?|(,*)/g, '') || '0';
                  return Number(parsed) || 0;
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="payment_mode"
              label={
                <Space>
                  <CreditCardOutlined />
                  <span>Payment Mode</span>
                  <span style={{ color: 'red' }}>*</span>
                </Space>
              }
              rules={[{ required: true, message: 'Please select payment mode' }]}
            >
              <Select 
                placeholder="Select payment mode"
                onChange={(value) => setPaymentMode(value)}
              >
                <Option value="cash">Cash</Option>
                <Option value="upi">UPI</Option>
                <Option value="card">Card</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
                <Option value="cheque">Cheque</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          
          {/* Reference Number - Show in same row as Payment Mode when not 'other' */}
          {paymentMode !== 'other' && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="reference_number"
                label="Reference Number (Optional)"
                extra="Additional reference number if needed"
              >
                <Input placeholder="Optional: Enter reference number" />
              </Form.Item>
            </Col>
          )}
        </Row>
        
        {/* Conditional fields based on payment mode */}
        {paymentMode === 'cheque' && (
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cheque_number"
                label="Cheque Number"
              >
                <Input placeholder="Enter cheque number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="bank_name"
                label="Bank Name"
              >
                <Input placeholder="Enter bank name" />
              </Form.Item>
            </Col>
          </Row>
        )}
        
        {['upi', 'card'].includes(paymentMode) && (
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="transaction_id"
                label="Transaction ID"
              >
                <Input placeholder="Enter transaction ID" />
              </Form.Item>
            </Col>
          </Row>
        )}
        
        {paymentMode === 'bank_transfer' && (
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="transaction_id"
                label="Transaction ID"
              >
                <Input placeholder="Enter transaction ID or reference number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="bank_name"
                label="Bank Name"
              >
                <Input placeholder="Enter bank name" />
              </Form.Item>
            </Col>
          </Row>
        )}
        
        {paymentMode === 'other' && (
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="reference_number"
                label="Reference Number"
              >
                <Input placeholder="Enter reference number" />
              </Form.Item>
            </Col>
          </Row>
        )}
        
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="notes"
              label="Notes"
            >
              <TextArea
                rows={3}
                placeholder="Optional: Add notes about this payment"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default POPaymentModal;

