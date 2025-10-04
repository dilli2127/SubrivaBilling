import React, { useCallback, useEffect, useState } from "react";
import { Form, Input, Button, Select, InputNumber, DatePicker, Switch, Card, Row, Col, message, Steps, Space } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined, CalendarOutlined, CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
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
  const [currentStep, setCurrentStep] = useState(0);
  
  const { loading, items } = useDynamicSelector(
    API_ROUTES.Tenant?.Create?.identifier || "tenant_signup"
  );

  const callBackServer = useCallback(
    (variables: ApiRequest, key: string) => {
      dispatch(dynamic_request(variables, key));
    },
    [dispatch]
  );

  const steps = [
    {
      title: 'Basic Information',
      description: 'Contact & Organization Details',
      icon: <UserOutlined />,
    },
    {
      title: 'Address Information',
      description: 'Location & Address Details',
      icon: <HomeOutlined />,
    },
    {
      title: 'Review & Submit',
      description: 'Verify and Create Account',
      icon: <CheckCircleOutlined />,
    },
  ];

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
    } else if (e.key === "ArrowLeft" && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (e.key === "ArrowRight" && currentStep < steps.length - 1) {
      nextStep();
    }
  };

  const nextStep = async (e?: React.MouseEvent) => {
    // Prevent form submission when clicking Next
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      // Validate current step fields
      const fieldsToValidate = getFieldsForStep(currentStep);
      await form.validateFields(fieldsToValidate);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error("Please fill in all required fields before proceeding.");
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return ['contact_name', 'organization_name', 'email', 'mobile', 'password', 'confirmPassword'];
      case 1:
        return ['address1', 'city', 'state', 'pincode'];
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Basic Information</h3>
            <p className={styles.stepDescription}>Enter your contact and organization details</p>
            
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
        );

      case 1:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Address Information</h3>
            <p className={styles.stepDescription}>Enter your organization's address details</p>
            
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
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Review & Submit</h3>
            <p className={styles.stepDescription}>Review your information and create your account</p>
            
            <div className={styles.reviewSection}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className={styles.reviewCard}>
                    <h4>Basic Information</h4>
                    <p><strong>Contact:</strong> {form.getFieldValue('contact_name')}</p>
                    <p><strong>Organization:</strong> {form.getFieldValue('organization_name')}</p>
                    <p><strong>Email:</strong> {form.getFieldValue('email')}</p>
                    <p><strong>Mobile:</strong> {form.getFieldValue('mobile')}</p>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className={styles.reviewCard}>
                    <h4>Address Information</h4>
                    <p><strong>Address:</strong> {form.getFieldValue('address1')}</p>
                    {form.getFieldValue('address2') && (
                      <p><strong>Address 2:</strong> {form.getFieldValue('address2')}</p>
                    )}
                    <p><strong>City:</strong> {form.getFieldValue('city')}</p>
                    <p><strong>State:</strong> {form.getFieldValue('state')}</p>
                    <p><strong>Pincode:</strong> {form.getFieldValue('pincode')}</p>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        );

      default:
        return null;
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

          <div className={styles.wizardContainer}>
            <Steps
              current={currentStep}
              items={steps}
              className={styles.wizardSteps}
            />

            <Form
              form={form}
              name="tenant_signup"
              className={styles.form}
              onFinish={onFinish}
              layout="vertical"
              size="large"
              autoComplete="off"
            >
              <div className={styles.stepWrapper}>
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className={styles.navigation}>
                <Space size="large">
                  {currentStep > 0 && (
                    <Button 
                      type="default" 
                      size="large"
                      className={styles.prevButton}
                      onClick={prevStep}
                      htmlType="button"
                      icon={<EditOutlined />}
                    >
                      Previous
                    </Button>
                  )}
                  
                  <Button 
                    type="default" 
                    size="large"
                    className={styles.cancelButton}
                    onClick={() => navigate("/")}
                    htmlType="button"
                  >
                    Cancel
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button 
                      type="primary" 
                      size="large"
                      className={styles.nextButton}
                      onClick={(e) => nextStep(e)}
                      htmlType="button"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      size="large"
                      className={styles.submitButton}
                      loading={loading}
                      icon={<CheckCircleOutlined />}
                    >
                      Create Account
                    </Button>
                  )}
                </Space>
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
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TenantSignup;
