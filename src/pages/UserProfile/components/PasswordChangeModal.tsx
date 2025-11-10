import React from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/es/form';

interface PasswordChangeModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  form: FormInstance;
  loading: boolean;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isVisible,
  onCancel,
  onSubmit,
  form,
  loading,
}) => {
  return (
    <Modal
      title="Change Password"
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="New Password"
          name="new_password"
          rules={[
            { required: true, message: 'Please enter new password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" size="large" />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirm_password"
          dependencies={['new_password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" size="large" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Update Password
            </Button>
            <Button onClick={onCancel} size="large">
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

