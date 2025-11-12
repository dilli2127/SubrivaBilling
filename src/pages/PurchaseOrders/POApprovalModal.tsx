import React, { useState } from 'react';
import { Modal, Form, Input, message, Space, Descriptions, Tag, Divider, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useApprovePurchaseOrderMutation, useRejectPurchaseOrderMutation } from '../../services/redux/api/endpoints';

interface POApprovalModalProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder: any;
}

const POApprovalModal: React.FC<POApprovalModalProps> = ({
  open,
  onClose,
  purchaseOrder,
}) => {
  const [form] = Form.useForm();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [approvePO, { isLoading: approving }] = useApprovePurchaseOrderMutation();
  const [rejectPO, { isLoading: rejecting }] = useRejectPurchaseOrderMutation();
  
  const handleApprove = async () => {
    try {
      const values = await form.validateFields();
      await approvePO({ id: purchaseOrder._id, comments: values.comments }).unwrap();
      message.success('Purchase order approved successfully');
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to approve PO');
    }
  };
  
  const handleReject = async () => {
    try {
      if (!rejectionReason) {
        message.error('Please provide a rejection reason');
        return;
      }
      await rejectPO({ id: purchaseOrder._id, reason: rejectionReason }).unwrap();
      message.success('Purchase order rejected');
      form.resetFields();
      setRejectionReason('');
      setRejectModalOpen(false);
      onClose();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to reject PO');
    }
  };
  
  const showRejectModal = () => {
    setRejectModalOpen(true);
  };
  
  return (
    <>
      <Modal
        title="Approve / Reject Purchase Order"
        open={open}
        onCancel={onClose}
        width={700}
        footer={[
          <Button
            key="reject"
            danger
            icon={<CloseCircleOutlined />}
            loading={rejecting}
            onClick={showRejectModal}
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
            Approve
          </Button>,
        ]}
      >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="PO Number" span={2}>
          <Tag color="blue">{purchaseOrder?.po_number}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Vendor" span={2}>
          {purchaseOrder?.VendorItem?.vendor_name}
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount" span={2}>
          <strong style={{ color: '#52c41a' }}>
            ₹{purchaseOrder?.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Items" span={2}>
          {purchaseOrder?.items?.length} items
        </Descriptions.Item>
        <Descriptions.Item label="Created By" span={2}>
          {purchaseOrder?.created_by_name}
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
      </Form>
    </Modal>
    
    {/* Rejection Modal */}
    <Modal
      title="Reject Purchase Order"
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
          placeholder="Enter the reason for rejecting this purchase order..."
        />
      </Form.Item>
    </Modal>
  </>
  );
};

export default POApprovalModal;

