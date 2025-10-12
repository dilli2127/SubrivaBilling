import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Descriptions,
  message,
  Space,
  Divider,
  Typography,
  Row,
  Col,
  Tag,
  Modal,
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
import { useUser } from '../../components/antd/UserContext';
import { setUserData, User } from '../../helpers/auth';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { ApiRequest } from '../../services/api/apiService';
import {
  dynamic_clear,
  dynamic_request,
  useDynamicSelector,
} from '../../services/redux';
import { API_ROUTES } from '../../services/api/utils';
import styles from './UserProfile.module.css';

const { Title, Text } = Typography;

const UserProfile: React.FC = () => {
  const user = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const dispatch: Dispatch<any> = useDispatch();

  const { loading: updateLoading, items: updateItems } = useDynamicSelector(
    API_ROUTES.BillingUsers.Update.identifier
  );

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        user_name: user.username || '',
      });
    }
  }, [user, form]);

  useEffect(() => {
    if (updateItems?.statusCode === 200) {
      message.success('Profile updated successfully!');
      
      // Update user data in sessionStorage
      const updatedUser: User = {
        ...user,
        name: form.getFieldValue('name') || user?.name || '',
        email: form.getFieldValue('email') || user?.email || '',
        mobile: form.getFieldValue('mobile') || user?.mobile || '',
        clientcode: user?.clientcode || '',
        usertype: user?.usertype || '',
        active: user?.active ?? true,
      };
      setUserData(updatedUser);
      
      setIsEditing(false);
      setIsChangingPassword(false);
      passwordForm.resetFields();
      dispatch(dynamic_clear(API_ROUTES.BillingUsers.Update.identifier));
      
      // Reload to update context
      window.location.reload();
    } else if (updateItems?.statusCode && updateItems.statusCode !== 200) {
      message.error(updateItems?.message || 'Failed to update profile');
      dispatch(dynamic_clear(API_ROUTES.BillingUsers.Update.identifier));
    }
  }, [updateItems, dispatch, user, form, passwordForm]);

  const handleUpdate = (values: any) => {
    if (!user?._id) {
      message.error('User ID not found');
      return;
    }

    const updateData: any = {
      name: values.name,
      email: values.email,
      mobile: values.mobile,
    };

    dispatch(
      dynamic_request(
        {
          method: API_ROUTES.BillingUsers.Update.method,
          endpoint: `${API_ROUTES.BillingUsers.Update.endpoint}${user._id}`,
          data: updateData,
        },
        API_ROUTES.BillingUsers.Update.identifier
      )
    );
  };

  const handlePasswordChange = (values: any) => {
    if (!user?._id) {
      message.error('User ID not found');
      return;
    }

    dispatch(
      dynamic_request(
        {
          method: API_ROUTES.BillingUsers.Update.method,
          endpoint: `${API_ROUTES.BillingUsers.Update.endpoint}${user._id}`,
          data: {
            password: values.new_password,
          },
        },
        API_ROUTES.BillingUsers.Update.identifier
      )
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      name: user?.name,
      email: user?.email,
      mobile: user?.mobile,
      user_name: user?.username || '',
    });
  };

  const userRole =
    user?.roleItems?.name || user?.usertype || user?.user_role || 'User';
  const orgName =
    user?.organisationItems?.org_name || user?.organisationItems?.name || 'N/A';
  const branchName =
    user?.branchItems?.branch_name || user?.branchItems?.name || 'N/A';

  // Get initials for avatar
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
    <div className={styles.userProfileContainer}>
      <div className={styles.userProfileHeader}>
        <Title level={2}>
          <UserOutlined /> My Profile
        </Title>
        <Text type="secondary">View and manage your account information</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Overview Card */}
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
              <Descriptions.Item
                label={
                  <span>
                    <IdcardOutlined /> Organisation
                  </span>
                }
              >
                <Text strong>{orgName}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <IdcardOutlined /> Branch
                  </span>
                }
              >
                <Text strong>{branchName}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Profile Details Card */}
        <Col xs={24} lg={16}>
          <Card
            className={`${styles.profileCard} ${styles.profileDetails}`}
            title="Personal Information"
            extra={
              !isEditing && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
              disabled={!isEditing}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Full Name"
                    name="name"
                    rules={[
                      { required: true, message: 'Please enter your full name' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Enter full name"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Username" name="user_name">
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Username"
                      size="large"
                      disabled
                    />
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
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Enter email"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Mobile Number"
                    name="mobile"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter your mobile number',
                      },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: 'Enter valid 10-digit mobile number',
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Enter mobile number"
                      maxLength={10}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {isEditing && (
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={updateLoading}
                      size="large"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancel}
                      icon={<CloseOutlined />}
                      size="large"
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          </Card>

          {/* Security Card */}
          <Card
            className={`${styles.profileCard} ${styles.securityCard}`}
            title="Security Settings"
            style={{ marginTop: 24 }}
          >
            <div className={styles.securitySection}>
              <div className={styles.securityItem}>
                <LockOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div className={styles.securityItemContent}>
                  <Text strong>Password</Text>
                  <br />
                  <Text type="secondary">
                    Update your password to keep your account secure
                  </Text>
                </div>
                <Button
                  type="default"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={isChangingPassword}
        onCancel={() => {
          setIsChangingPassword(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            label="New Password"
            name="new_password"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter new password"
              size="large"
            />
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
                  return Promise.reject(
                    new Error('The two passwords do not match!')
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm new password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateLoading}
                size="large"
              >
                Update Password
              </Button>
              <Button
                onClick={() => {
                  setIsChangingPassword(false);
                  passwordForm.resetFields();
                }}
                size="large"
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;

