import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Button, message, Typography, Tabs } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { setUserData, setAuthToken, setTokens } from '../../helpers/auth';
import { setPermissions, setMenuKeys, setUserData as setUserDataHelper } from '../../helpers/permissionHelper';
import { useBillingLoginMutation, useTenantLoginMutation, useLazyGetSubscriptionStatusQuery } from '../../services/redux/api/endpoints';
import LandingPageHeader from '../../components/common/LandingPageHeader';

const { Text } = Typography;
const { TabPane } = Tabs;

const BillingLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'tenant' | 'user'>('user');
  
  // RTK Query mutations
  const [billingLogin, { isLoading: billingLoading, error: billingError }] = useBillingLoginMutation();
  const [tenantLogin, { isLoading: tenantLoading, error: tenantError }] = useTenantLoginMutation();
  const [getSubscriptionStatus] = useLazyGetSubscriptionStatusQuery();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const result = loginType === 'tenant' 
        ? await tenantLogin({ ...values, loginType }).unwrap()
        : await billingLogin({ ...values, loginType }).unwrap();

      if ((result as any).statusCode === 200) {
        message.success('Login successful! Welcome back.');

        const data = (result as any).result || result;
        
        // Store tokens - support both old and new formats
        if (data?.accessToken && data?.refreshToken) {
          setTokens(data.accessToken, data.refreshToken);
        } else if (data?.token) {
          setAuthToken(data.token);
        }
        
        // Store user data
        if (data?.UserItem) {
          setUserData(data.UserItem);
        }
        
        // Store permissions for role-based access control
        if (data?.permissions) {
          setPermissions(data.permissions);
        }
        
        // Store allowedMenuKeys for menu filtering
        if (data?.allowedMenuKeys) {
          setMenuKeys(data.allowedMenuKeys);
        }
        
        // Store complete user data for new API structure
        if (data) {
          setUserDataHelper(data);
        }
        
        // Fetch subscription status after successful login
        // This is cached and will be available when user visits settings
        try {
          await getSubscriptionStatus(undefined).unwrap();
        } catch (error) {
          // Silently fail - subscription check is not critical for login
          console.warn('Failed to fetch subscription status:', error);
        }
        
        navigate('/dashboard');
      } else {
        message.error((result as any).message || 'Login failed, please try again');
      }
    } catch (error: any) {
      message.error(error?.data?.message || error?.message || 'Login failed, please try again');
    }
  };
  return (
    <>
      <LandingPageHeader showBackButton={true} />
      <div className={styles.loginBackgroundRich}>
        <div className={styles.loginFormCardRich}>
        <div className={styles.loginHeaderRich}>
          <img
            src={require('../../assets/img/ffslogo.png')}
            alt="Logo"
            className={styles.loginLogoRich}
          />
          <span className={styles.loginAppnameRich}>Subriva Billing</span>
          <span className={styles.loginTitleRich}>Welcome Back</span>
        </div>
        
        <Tabs
          defaultActiveKey="user"
          onChange={key => setLoginType(key as 'tenant' | 'user')}
          className={styles.loginTabsRich}
        >
          <TabPane tab="User" key="user" />
          <TabPane tab="Tenant" key="tenant" />
        </Tabs>
        
        <Form
          name="login_form"
          className={styles.loginFormRich}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>
          
          <Form.Item className={styles.loginOptionsRich}>
            <a
              onClick={() => navigate('/forgot-password')}
              className={styles.forgotPasswordRich}
            >
              Forgot password?
            </a>
          </Form.Item>
          
          <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.loginButtonRich}
                loading={loginType === 'tenant' ? tenantLoading : billingLoading}
                size="large"
                block
              >
                Log in
              </Button>
          </Form.Item>
          
          <Form.Item className={styles.signupLinkRich}>
            <Text className={styles.authSwitchRich}>
              Don't have an account?{' '}
              <a onClick={() => navigate('/tenant-signup')}>Sign up</a>
            </Text>
          </Form.Item>
        </Form>
        </div>
      </div>
    </>
  );
};

export default BillingLogin;
