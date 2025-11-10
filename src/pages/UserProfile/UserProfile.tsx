import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  message,
  Typography,
  Tabs,
  Breadcrumb,
} from 'antd';
import {
  UserOutlined,
  CrownOutlined,
  SettingOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../components/antd/UserContext';
import { setUserData } from '../../helpers/auth';
import { apiSlice } from '../../services/redux/api/apiSlice';
import { 
  useGetSubscriptionStatusQuery, 
  useGetMyPlanLimitsQuery,
  PlanLimitsResponse
} from '../../services/redux/api/endpoints';
import {
  processSubscriptionStatus,
} from '../../utils/subscriptionUtils';
import {
  AccountTab,
  SubscriptionTab,
  SettingsTab,
  TermsTab,
  PasswordChangeModal,
} from './components';
import styles from './UserProfile.module.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const UserProfile: React.FC = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  // RTK Query mutations and queries
  const [updateBillingUser, { isLoading: updateLoading }] = apiSlice.useUpdateBillingUsersMutation();
  
  // Subscription data
  const { 
    data: subscriptionData, 
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription 
  } = useGetSubscriptionStatusQuery(undefined);
  
  const { 
    data: planLimitsData, 
    isLoading: isLoadingLimits,
    refetch: refetchLimits 
  } = useGetMyPlanLimitsQuery(undefined);

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

  const handleUpdate = async (values: any) => {
    if (!user?._id) {
      message.error('User ID not found');
      return;
    }

    try {
      const updateData: any = {
        name: values.name,
        email: values.email,
        mobile: values.mobile,
      };

      const result = await updateBillingUser({ id: user._id, ...updateData }).unwrap();
      message.success('Profile updated successfully');
      setIsEditing(false);
      
      const userResult = (result as any)?.result || result;
      if (userResult) {
        setUserData(userResult);
      }
      
      window.location.reload();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (values: any) => {
    if (!user?._id) {
      message.error('User ID not found');
      return;
    }

    try {
      await updateBillingUser({
        id: user._id,
        password: values.new_password,
      }).unwrap();
      message.success('Password changed successfully');
      setIsChangingPassword(false);
      passwordForm.resetFields();
      window.location.reload();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to change password');
    }
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

  const handleRefreshSubscription = async () => {
    try {
      await Promise.all([refetchSubscription(), refetchLimits()]);
      message.success('Subscription information refreshed');
    } catch (error) {
      message.error('Failed to refresh subscription information');
    }
  };

  // Process subscription info
  const processedStatus = processSubscriptionStatus(subscriptionData);
  const subscriptionInfo = subscriptionData ? {
    ...processedStatus,
    daysRemaining: processedStatus.daysRemaining ?? null,
    limits: (planLimitsData as PlanLimitsResponse)?.result?.limits,
    currentUsage: (planLimitsData as PlanLimitsResponse)?.result?.current_usage,
  } : null;

  return (
    <div className={styles.userProfileContainer}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <HomeOutlined />
            <span style={{ marginLeft: 4 }}>Home</span>
          </span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <UserOutlined />
          <span style={{ marginLeft: 4 }}>My Profile</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <div className={styles.userProfileHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 8 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            size="large"
            style={{ flexShrink: 0 }}
          >
            Back
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <UserOutlined /> My Profile
          </Title>
        </div>
        <Text type="secondary">Manage your account, subscription, and settings</Text>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        size="large"
        type="card"
        style={{ marginBottom: 24 }}
      >
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Account Details
            </span>
          }
          key="account"
        >
          <AccountTab
            user={user}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            setIsChangingPassword={setIsChangingPassword}
            form={form}
            updateLoading={updateLoading}
            handleUpdate={handleUpdate}
            handleCancel={handleCancel}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              <CrownOutlined />
              Subscription
            </span>
          }
          key="subscription"
        >
          <SubscriptionTab
            subscriptionInfo={subscriptionInfo}
            isLoadingSubscription={isLoadingSubscription}
            isLoadingLimits={isLoadingLimits}
            onRefresh={handleRefreshSubscription}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined />
              Settings
            </span>
          }
          key="settings"
        >
          <SettingsTab />
        </TabPane>

        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              Terms & Conditions
            </span>
          }
          key="terms"
        >
          <TermsTab />
        </TabPane>
      </Tabs>

      {/* Change Password Modal */}
      <PasswordChangeModal
        isVisible={isChangingPassword}
        onCancel={() => {
          setIsChangingPassword(false);
          passwordForm.resetFields();
        }}
        onSubmit={handlePasswordChange}
        form={passwordForm}
        loading={updateLoading}
      />
    </div>
  );
};

export default UserProfile;
