import React, { useCallback, useEffect } from "react";
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
import type { ApiRequest } from "../../services/api/apiService";
import {
  dynamic_clear,
  dynamic_request,
  useDynamicSelector,
} from "../../services/redux";
import { useDispatch } from "react-redux";
import type { Dispatch } from "redux";
import { API_ROUTES } from "../../services/api/utils";

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const callBackServer = useCallback(
    (variables: ApiRequest, key: string) => {
      dispatch(dynamic_request(variables, key));
    },
    [dispatch]
  );
  const { loading, items } = useDynamicSelector(
    API_ROUTES.Login.Create.identifier
  );
  const onFinish = (values: {
    username: string;
    password: string;
  }) => {
    callBackServer(
      {
        method: API_ROUTES.Login.Create.method,
        endpoint: API_ROUTES.Login.Create.endpoint,
        data: values,
      },
      API_ROUTES.Login.Create.identifier
    );
  };
  useEffect(() => {
    if (items?.statusCode === 200) {
      message.success("Login successful! Welcome back.");
      sessionStorage.setItem("token", items?.result?.token);
      sessionStorage.setItem("user", JSON.stringify(items?.result?.UserItem));
      dispatch(dynamic_clear(API_ROUTES.Login.Create.identifier));
      if (items?.result?.UserItem?.usertype === "admin") {
        navigate("/admin/einvite_crud");
      } else {
        navigate("/dashboard");
      }
    } else if (items?.statusCode && items.statusCode !== 200) {
        message.error(items?.message || "Login failed, please try again");
    }
  }, [items]);
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
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={loading}
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