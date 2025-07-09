import React, { useCallback, useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Tabs,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { ApiRequest } from "../../services/api/apiService";
import {
  dynamic_clear,
  dynamic_request,
  useDynamicSelector,
} from "../../services/redux";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { API_ROUTES } from "../../services/api/utils";

const { Title, Text } = Typography;

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
  const { loading, items } = useDynamicSelector(
    API_ROUTES.BillingLogin.Create.identifier
  );
  const { loading:TenantLoading, items:TenantItems } = useDynamicSelector(
    API_ROUTES.TenantLogin.Create.identifier
  );
  const onFinish = (values: {
    username: string;
    password: string;
  }) => {
    if (loginType === 'tenant') {
      callBackServer(
        {
          method: API_ROUTES.TenantLogin.Create.method,
          endpoint: API_ROUTES.TenantLogin.Create.endpoint,
          data: { ...values, loginType },
        },
        API_ROUTES.TenantLogin.Create.identifier
      );
    } else {
      callBackServer(
        {
          method: API_ROUTES.BillingLogin.Create.method,
          endpoint: API_ROUTES.BillingLogin.Create.endpoint,
          data: { ...values, loginType },
        },
        API_ROUTES.BillingLogin.Create.identifier
      );
    }
  };
  useEffect(() => {
    if (items?.statusCode === 200) {
      message.success("Login successful! Welcome back.");
      sessionStorage.setItem("token", items?.result?.token);
      sessionStorage.setItem("user", JSON.stringify(items?.result?.UserItem));
      dispatch(dynamic_clear(API_ROUTES.BillingLogin.Create.identifier));
      if (items?.result?.UserItem?.roleItems?.name === "Admin") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else if (items?.statusCode && items.statusCode !== 200) {
        message.error(items?.message || "Login failed, please try again");
    }
  }, [items]);
  useEffect(() => {
    if (TenantItems?.statusCode === 200) {
      message.success("Login successful! Welcome back.");
      sessionStorage.setItem("token", TenantItems?.result?.token);
      sessionStorage.setItem("user", JSON.stringify(TenantItems?.result?.UserItem));
      dispatch(dynamic_clear(API_ROUTES.TenantLogin.Create.identifier));
      if (TenantItems?.result?.UserItem?.roleItems?.name === "Admin") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else if (TenantItems?.statusCode && items.statusCode !== 200) {
        message.error(items?.message || "Login failed, please try again");
    }
  }, [TenantItems]);
  return (
    <div className="login-background-rich">
      <div className="login-form-card-rich">
        <div className="login-header-rich">
          <img src={require('../../assets/img/ffslogo.png')} alt="Logo" className="login-logo-rich" />
          <span className="login-appname-rich">Subriva Billing</span>
          <span className="login-title-rich">Welcome Back</span>
        </div>
        <Tabs
          defaultActiveKey="user"
          onChange={(key) => setLoginType(key as 'tenant' | 'user')}
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
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item className="login-options-rich">
            <a href="#" className="forgot-password-rich">
              Forgot password?
            </a>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button-rich"
              loading={loading}
              size="large"
              block
            >
              Log in
            </Button>
          </Form.Item>
          <Form.Item className="signup-link-rich">
            <Text className="auth-switch-rich">
              Don't have an account?{' '}
              <a onClick={() => navigate("/signup")}>Sign up</a>
            </Text>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default BillingLogin;