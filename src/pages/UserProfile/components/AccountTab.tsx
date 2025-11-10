import React from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Descriptions,
  Space,
  Divider,
  Typography,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { FormInstance } from 'antd/es/form';
import styles from '../UserProfile.module.css';

const { Title, Text } = Typography;

interface AccountTabProps {
  user: any;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setIsChangingPassword: (value: boolean) => void;
  form: FormInstance;
  updateLoading: boolean;
  handleUpdate: (values: any) => Promise<void>;
  handleCancel: () => void;
}

export const AccountTab: React.FC<AccountTabProps> = ({
  user,
  isEditing,
  setIsEditing,
  setIsChangingPassword,
  form,
  updateLoading,
  handleUpdate,
  handleCancel,
}) => {
  const userRole = user?.roleItems?.name || user?.usertype || user?.user_role || 'User';
  const orgName = user?.organisationItems?.org_name || user?.organisationItems?.name || 'N/A';
  const branchName = user?.branchItems?.branch_name || user?.branchItems?.name || 'N/A';

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={8}>
        <Card className={`${styles.profileCard} ${styles.profileOverview}`}>
          <div className={styles.profileAvatarSection}>
            <Avatar size={120} className={styles.profileAvatar}>
              {getInitials(user?.name)}
            </Avatar>
            <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
              {user?.name || 'User Name'}
            </Title>
            <Text type="secondary">@{user?.username || user?.name || 'username'}</Text>
            <div style={{ marginTop: 16 }}>
              <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                {userRole}
              </Tag>
            </div>
          </div>

          <Divider />

          <Descriptions column={1} size="small">
            <Descriptions.Item label={<span><IdcardOutlined /> Organisation</span>}>
              <Text strong>{orgName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><IdcardOutlined /> Branch</span>}>
              <Text strong>{branchName}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col xs={24} lg={16}>
        <Card
          className={`${styles.profileCard} ${styles.profileDetails}`}
          title="Personal Information"
          extra={
            !isEditing && (
              <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )
          }
        >
          <Form form={form} layout="vertical" onFinish={handleUpdate} disabled={!isEditing}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter your full name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Enter full name" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Username" name="user_name">
                  <Input prefix={<UserOutlined />} placeholder="Username" size="large" disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Enter a valid email' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Enter email" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Mobile Number"
                  name="mobile"
                  rules={[
                    { required: true, message: 'Please enter your mobile number' },
                    { pattern: /^[0-9]{10}$/, message: 'Enter valid 10-digit mobile number' },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Enter mobile number" maxLength={10} size="large" />
                </Form.Item>
              </Col>
            </Row>

            {isEditing && (
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updateLoading} size="large">
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} icon={<CloseOutlined />} size="large">
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            )}
          </Form>
        </Card>

        <Card className={`${styles.profileCard} ${styles.securityCard}`} title="Security Settings" style={{ marginTop: 24 }}>
          <div className={styles.securitySection}>
            <div className={styles.securityItem}>
              <LockOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div className={styles.securityItemContent}>
                <Text strong>Password</Text>
                <br />
                <Text type="secondary">Update your password to keep your account secure</Text>
              </div>
              <Button type="default" onClick={() => setIsChangingPassword(true)}>
                Change Password
              </Button>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

