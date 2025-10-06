import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Button, message, Typography, Tabs } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { ApiRequest } from '../../services/api/apiService';
import {
  dynamic_clear,
  dynamic_request,
  useDynamicSelector,
} from '../../services/redux';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { API_ROUTES } from '../../services/api/utils';

const { Text } = Typography;
const { TabPane } = Tabs;

const BillingLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const [loginType, setLoginType] = useState<'tenant' | 'user'>('user');
  
  const callBackServer = useCallback(
    (variables: ApiRequest, key: string) => {
      dispatch(dynamic_request(variables, key));
    },
    [dispatch]
  );

  const {
    loading,
    items,
    error: BillingLoginError,
  } = useDynamicSelector(API_ROUTES.BillingLogin.Create.identifier);
  
  const {
    loading: TenantLoading,
    items: TenantItems,
    error: TenantError,
  } = useDynamicSelector(API_ROUTES.TenantLogin.Create.identifier);

  const onFinish = (values: { username: string; password: string }) => {
    const isTenant = loginType === 'tenant';
    const route = isTenant ? API_ROUTES.TenantLogin.Create : API_ROUTES.BillingLogin.Create;
    
    callBackServer(
      {
        method: route.method,
        endpoint: route.endpoint,
        data: { ...values, loginType },
      },
      route.identifier
    );
  };

  // Consolidated login success/error handling
  useEffect(() => {
    const currentItems = loginType === 'tenant' ? TenantItems : items;
    const currentError = loginType === 'tenant' ? TenantError : BillingLoginError;
    const currentRoute = loginType === 'tenant' ? API_ROUTES.TenantLogin.Create : API_ROUTES.BillingLogin.Create;

    if (currentItems?.statusCode === 200) {
      message.success('Login successful! Welcome back.');
      sessionStorage.setItem('token', currentItems?.result?.token);
      sessionStorage.setItem('user', JSON.stringify(currentItems?.result?.UserItem));
      dispatch(dynamic_clear(currentRoute.identifier));
      navigate('/dashboard');
    } else if (currentError) {
      message.error(currentError?.message || 'Login failed, please try again');
      dispatch(dynamic_clear(currentRoute.identifier));
    }
  }, [items, TenantItems, BillingLoginError, TenantError, loginType, dispatch, navigate]);
  return (
    <div className="login-background-rich">
      <div className="login-form-card-rich">
        <div className="login-header-rich">
          <img
            src={require('../../assets/img/ffslogo.png')}
            alt="Logo"
            className="login-logo-rich"
          />
          <span className="login-appname-rich">Subriva Billing</span>
          <span className="login-title-rich">Welcome Back</span>
        </div>
        
        <Tabs
          defaultActiveKey="user"
          onChange={key => setLoginType(key as 'tenant' | 'user')}
          className="login-tabs-rich"
        >
          <TabPane tab="User" key="user" />
          <TabPane tab="Tenant" key="tenant" />
        </Tabs>
        
        <Form
          name="login_form"
          className="login-form-rich"
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
          
          <Form.Item className="login-options-rich">
            <a
              onClick={() => navigate('/forgot-password')}
              className="forgot-password-rich"
            >
              Forgot password?
            </a>
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button-rich"
              loading={loginType === 'tenant' ? TenantLoading : loading}
              size="large"
              block
            >
              Log in
            </Button>
          </Form.Item>
          
          <Form.Item className="signup-link-rich">
            <Text className="auth-switch-rich">
              Don't have an account?{' '}
              <a onClick={() => navigate('/tenant-signup')}>Sign up</a>
            </Text>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default BillingLogin;
