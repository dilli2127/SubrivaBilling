import React from "react";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useLoginMutation, useLazyGetSubscriptionStatusQuery } from "../../services/redux/api/endpoints";
import { setUserData, setAuthToken, setTokens } from "../../helpers/auth";
import { setPermissions, setMenuKeys, setUserData as setUserDataHelper } from "../../helpers/permissionHelper";

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const [getSubscriptionStatus] = useLazyGetSubscriptionStatusQuery();

  const onFinish = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      const result = await login(values).unwrap();
      
      if ((result as any).statusCode === 200) {
        message.success("Login successful! Welcome back.");

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
        
        if (data?.UserItem?.usertype === "admin") {
          navigate("/admin/einvite_crud");
        } else {
          navigate("/dashboard");
        }
      } else {
        message.error((result as any).message || 'Login failed, please try again');
      }
    } catch (error: any) {
      message.error(error?.data?.message || error?.message || 'Login failed, please try again');
    }
  };

  return (
    <div className="login-background">
      <div className="login-form-container">
        <Title level={2} className="login-title" style={{ color: '#222', marginBottom: 8 }}>
          Welcome Back
        </Title>
        <Text className="login-subtitle" style={{ color: '#444', marginBottom: 20, display: 'block' }}>Sign in to continue</Text>
        <Form
          name="login_form"
          className="login-form"
          onFinish={onFinish}
          style={{ width: 300 }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item className="login-options">
            <a onClick={() => navigate("/forgot-password")} className="forgot-password">
              Forgot password?
            </a>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={isLoading}
            >
              Log in
            </Button>
          </Form.Item>

          <Form.Item className="signup-link">
            <Text className="auth-switch">
              Don't have an account?{" "}
              <a onClick={() => navigate("/signup")}>Sign up</a>
            </Text>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;