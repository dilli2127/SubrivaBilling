import React, { useState } from 'react';
import { Modal, Form, Input, message, Descriptions, Tag, Divider, Button, Checkbox, Space, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useApproveSalesReturnMutation, useRejectSalesReturnMutation } from '../../services/redux/api/endpoints';

interface ReturnApprovalModalProps {
  open: boolean;
  onClose: () => void;
  salesReturn: any;
}

const ReturnApprovalModal: React.FC<ReturnApprovalModalProps> = ({
  open,
  onClose,
  salesReturn,
}) => {
  const [form] = Form.useForm();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [autoRestock, setAutoRestock] = useState(true);
  
  const [approveReturn, { isLoading: approving }] = useApproveSalesReturnMutation();
  const [rejectReturn, { isLoading: rejecting }] = useRejectSalesReturnMutation();
  
  const handleApprove = async () => {
    try {
      const values = await form.validateFields();
      await approveReturn({ 
        id: salesReturn._id, 
        comments: values.comments,
        auto_restock: autoRestock
      }).unwrap();
      message.success('Sales return approved successfully');
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to approve return');
    }
  };
  
  const handleReject = async () => {
    try {
      if (!rejectionReason) {
        message.error('Please provide a rejection reason');
        return;
      }
      await rejectReturn({ id: salesReturn._id, reason: rejectionReason }).unwrap();
      message.success('Sales return rejected');
      form.resetFields();
      setRejectionReason('');
      setRejectModalOpen(false);
      onClose();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to reject return');
    }
  };
  
  return (
    <>
      <Modal
        title="Approve / Reject Sales Return"
        open={open}
        onCancel={onClose}
        width={700}
        footer={[
          <Button
            key="reject"
            danger
            icon={<CloseCircleOutlined />}
            loading={rejecting}
            onClick={() => setRejectModalOpen(true)}
          >
            Reject
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={approving}
            onClick={handleApprove}
          >
            Approve & Process
          </Button>,
        ]}
      >
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Return Number" span={2}>
            <Tag color="orange">{salesReturn?.return_number}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Customer" span={2}>
            {salesReturn?.customer_name}
          </Descriptions.Item>
          <Descriptions.Item label="Invoice Number">
            <Tag color="blue">{salesReturn?.invoice_number}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Refund Type">
            <Tag color="green">{salesReturn?.refund_type?.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Refund Amount" span={2}>
            <strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
              ₹{Number(salesReturn?.refund_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label="Items" span={2}>
            {salesReturn?.items?.length} items
          </Descriptions.Item>
          <Descriptions.Item label="Return Reason" span={2}>
            <Tag>{salesReturn?.return_reason?.replace('_', ' ').toUpperCase()}</Tag>
            {salesReturn?.return_reason_notes && (
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                {salesReturn.return_reason_notes}
              </div>
            )}
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Form form={form} layout="vertical">
          <Form.Item
            name="comments"
            label="Comments (Optional)"
          >
            <Input.TextArea rows={3} placeholder="Add any comments..." />
          </Form.Item>
          
          <Form.Item>
            <Checkbox
              checked={autoRestock}
              onChange={(e) => setAutoRestock(e.target.checked)}
            >
              <Space direction="vertical" size={0}>
                <strong>Auto-restock returned items</strong>
                <span style={{ fontSize: '11px', color: '#888' }}>
                  Automatically add items back to inventory
                </span>
              </Space>
            </Checkbox>
          </Form.Item>
          
          {salesReturn?.refund_type === 'points' && (
            <Alert
              message="Customer Points Refund"
              description={`${Math.floor(salesReturn.refund_amount || 0)} points (₹${Number(salesReturn.refund_amount || 0).toFixed(2)} value) will be added to customer's points balance after approval.`}
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Form>
      </Modal>
      
      {/* Rejection Modal */}
      <Modal
        title="Reject Sales Return"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleReject}
        confirmLoading={rejecting}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <Form.Item
          label="Rejection Reason"
          required
        >
          <Input.TextArea
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter the reason for rejecting this return..."
          />
        </Form.Item>
      </Modal>
    </>
  );
};

export default ReturnApprovalModal;

