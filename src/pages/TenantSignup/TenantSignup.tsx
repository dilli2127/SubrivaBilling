import React, { useCallback, useEffect, useState } from "react";
import { Form, Input, Button, Select, InputNumber, DatePicker, Switch, Card, Row, Col, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined, CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./TenantSignup.module.css";
import { ApiRequest } from "../../services/api/apiService";
import { dynamic_clear, dynamic_request, useDynamicSelector } from "../../services/redux";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { API_ROUTES } from "../../services/api/utils";
import dayjs from "dayjs";

const { Option } = Select;

const TenantSignup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const [form] = Form.useForm();
  
  const { loading, items } = useDynamicSelector(
    API_ROUTES.Tenant?.Create?.identifier || "tenant_signup"
  );

  const callBackServer = useCallback(
    (variables: ApiRequest, key: string) => {
      dispatch(dynamic_request(variables, key));
    },
    [dispatch]
  );

  const onFinish = (values: any) => {
    // Process form data before sending
    const processedValues = {
      ...values,
      license_start: values.license_start?.format("YYYY-MM-DD"),
      license_expiry: values.license_expiry?.format("YYYY-MM-DD"),
    };

    callBackServer(
      {
        method: API_ROUTES.Tenant?.Create?.method || "POST",
        endpoint: API_ROUTES.Tenant?.Create?.endpoint || "/tenant_accounts",
        data: processedValues,
      },
      API_ROUTES.Tenant?.Create?.identifier || "tenant_signup"
    );
  };

  useEffect(() => {
    if (items?.statusCode === 200) {
      message.success("Tenant account created successfully!");
      dispatch(dynamic_clear(API_ROUTES.Tenant?.Create?.identifier || "tenant_signup"));
      navigate("/login");
    }
  }, [items, navigate, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard navigation support
    if (e.key === "Escape") {
      navigate("/");
    }
  };

  return (
    <div className={styles.container} onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className={styles.background} />
      
      <div className={styles.content}>
        <Card className={styles.signupCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>Create Tenant Account</h1>
            <p className={styles.subtitle}>
              Set up your organization's billing management system
            </p>
          </div>

          <Form
            form={form}
            name="tenant_signup"
            className={styles.form}
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            {/* Basic Information Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="contact_name"
                    label="Contact Name"
                    rules={[{ required: true, message: "Please enter contact name!" }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Enter contact name"
                      autoFocus
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="organization_name"
                    label="Organization Name"
                    rules={[{ required: true, message: "Please enter organization name!" }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Enter organization name"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: "Please enter email address!" },
                      { type: "email", message: "Please enter a valid email!" }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="Enter email address"
                      type="email"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="mobile"
                    label="Mobile Number"
                    rules={[{ required: true, message: "Please enter mobile number!" }]}
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      placeholder="Enter mobile number"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: "Please enter password!" },
                      { min: 6, message: "Password must be at least 6 characters!" }
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Enter password"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: "Please confirm your password!" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Passwords do not match!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Confirm password"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>


            {/* Address Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Address Information</h3>
              
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Form.Item
                    name="address1"
                    label="Address Line 1"
                    rules={[{ required: true, message: "Please enter address line 1!" }]}
                  >
                    <Input 
                      prefix={<HomeOutlined />} 
                      placeholder="Enter address line 1"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="address2"
                    label="Address Line 2"
                  >
                    <Input 
                      prefix={<HomeOutlined />} 
                      placeholder="Enter address line 2"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="city"
                    label="City"
                    rules={[{ required: true, message: "Please enter city!" }]}
                  >
                    <Input placeholder="Enter city" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="state"
                    label="State"
                    rules={[{ required: true, message: "Please enter state!" }]}
                  >
                    <Input placeholder="Enter state" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="pincode"
                    label="Pincode"
                    rules={[{ required: true, message: "Please enter pincode!" }]}
                  >
                    <Input placeholder="Enter pincode" />
                  </Form.Item>
                </Col>
              </Row>
            </div>


            {/* Action Buttons */}
            <div className={styles.actions}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Button 
                    type="default" 
                    size="large"
                    className={styles.cancelButton}
                    onClick={() => navigate("/")}
                    block
                  >
                    Cancel
                  </Button>
                </Col>
                <Col xs={24} md={12}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    className={styles.submitButton}
                    loading={loading}
                    block
                  >
                    Create Tenant Account
                  </Button>
                </Col>
              </Row>
            </div>

            <div className={styles.footer}>
              <p>
                Already have an account?{" "}
                <a href="/login" className={styles.loginLink}>
                  Sign in here
                </a>
              </p>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default TenantSignup;
