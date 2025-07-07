import React, { useCallback, useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, message, Row, Col, Card } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import type { ApiRequest } from "../../services/api/apiService";
import { dynamic_clear, dynamic_request, useDynamicSelector } from "../../services/redux";
import { useDispatch } from "react-redux";
import type { Dispatch } from "redux";
import { API_ROUTES } from "../../services/api/utils";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const { loading, items } = useDynamicSelector(
    API_ROUTES.Signup.Create.identifier
  );
  console.log(items);
  const callBackServer = useCallback(
    (variables: ApiRequest, key: string) => {
      dispatch(dynamic_request(variables, key));
    },
    [dispatch]
  );
  const onFinish = (values: {
    username: string;
    email: string;
    password: string;
    confirm: string;
  }) => {
    callBackServer(
      {
        method: API_ROUTES.Signup.Create.method,
        endpoint: API_ROUTES.Signup.Create.endpoint,
        data: values,
      },
      API_ROUTES.Signup.Create.identifier
    );
  };
  useEffect(() => {
    if (items?.statusCode === 200) {
      message.success("Signup successful! Please log in.");
      dispatch(dynamic_clear(API_ROUTES.Signup.Create.identifier));
      navigate("/login");
    }
  }, [items]);
  return (
    <Row className="signup-container">
      <Col xs={24} sm={12} className="signup-background" />
      <Col xs={24} sm={12} className="signup-content">
        <Card className="signup-card">
          <h1 className="signup-title">Create an Account</h1>
          <span className="signup-subtitle">
            Join us and start your journey!
          </span>
          <Form name="signup_form" className="signup-form" onFinish={onFinish}>
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Name" />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please input your Email!" }]}
            >
              <Input
                prefix={<MailOutlined />}
                type="email"
                placeholder="Email"
              />
            </Form.Item>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="mobile"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Mobile Number!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Mobile Number"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="clientcode"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Client Code!",
                    },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Client Code" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item
              name="confirm"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm your Password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
              />
            </Form.Item>
            <Form.Item>
              <Checkbox> I agree to the Terms and Conditions </Checkbox>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="signup-button"
                loading={loading}
              >
                Sign Up
              </Button>
            </Form.Item>
            <div className="login-link">
              Already have an account? <a href="/login">Log in</a>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default Signup;
