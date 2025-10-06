import React, { useCallback, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  message,
  Steps,
  Space,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import LandingPageHeader from '../../components/common/LandingPageHeader';
import styles from './TenantSignup.module.css';
import { ApiRequest } from '../../services/api/apiService';
import {
  dynamic_clear,
  dynamic_request,
  useDynamicSelector,
} from '../../services/redux';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { API_ROUTES } from '../../services/api/utils';


const REQUIRED_FIELDS = [
  'contact_name',
  'organization_name',
  'email',
  'mobile',
  'password',
  'confirmPassword',
  'address1',
  'city',
  'state',
  'pincode',
];

const TenantSignup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  const { loading, items } = useDynamicSelector(
    API_ROUTES.Tenant?.Create?.identifier || 'tenant_signup'
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

  const onFinish = async (values: any) => {
    // Validate all steps before proceeding
    const isValid = await validateAllSteps();
    if (!isValid) {
      return;
    }

    // Get all form values from all steps
    const allFormValues = form.getFieldsValue();
    
    const processedValues = {
      ...allFormValues,
    };

    callBackServer(
      {
        method: API_ROUTES.Tenant?.Create?.method || 'POST',
        endpoint: API_ROUTES.Tenant?.Create?.endpoint || '/tenant_accounts',
        data: processedValues,
      },
      API_ROUTES.Tenant?.Create?.identifier || 'tenant_signup'
    );
  };

  useEffect(() => {
    if (items?.statusCode === 200) {
      message.success('Tenant account created successfully!');
      dispatch(
        dynamic_clear(API_ROUTES.Tenant?.Create?.identifier || 'tenant_signup')
      );
      navigate('/billing_login');
    }
  }, [items, navigate, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      navigate('/');
    } else if (e.key === 'ArrowLeft' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
      nextStep();
    }
  };

  const nextStep = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const fieldsToValidate = getFieldsForStep(currentStep);
      await form.validateFields(fieldsToValidate);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('Please fill in all required fields before proceeding.');
    }
  };

  const validateAllSteps = async () => {
    try {
      await form.validateFields(REQUIRED_FIELDS);
      return true;
    } catch (error) {
      message.error('Please fill in all required fields before submitting.');
      return false;
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const getFieldsForStep = (step: number) => {
    const stepFields = {
      0: ['contact_name', 'organization_name', 'email', 'mobile', 'password', 'confirmPassword'],
      1: ['address1', 'city', 'state', 'pincode'],
    };
    return stepFields[step as keyof typeof stepFields] || [];
  };

  const renderStepContent = (step: number = currentStep) => {
    switch (step) {
      case 0:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Basic Information</h3>
            <p className={styles.stepDescription}>
              Enter your contact and organization details
            </p>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="contact_name"
                  label="Contact Name"
                  rules={[
                    { required: true, message: 'Please enter contact name!' },
                  ]}
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
                  rules={[
                    {
                      required: true,
                      message: 'Please enter organization name!',
                    },
                  ]}
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
                    { required: true, message: 'Please enter email address!' },
                    { type: 'email', message: 'Please enter a valid email!' },
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
                  rules={[
                    { required: true, message: 'Please enter mobile number!' },
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.resolve();
                        }
                        
                        // Remove any non-digit characters
                        const cleanValue = value.replace(/\D/g, '');
                        
                        // Check if it's exactly 10 digits
                        if (cleanValue.length !== 10) {
                          return Promise.reject(
                            new Error('Mobile number must be exactly 10 digits!')
                          );
                        }
                        
                        // Check if it starts with 6, 7, 8, or 9 (valid Indian mobile number prefixes)
                        if (!/^[6-9]/.test(cleanValue)) {
                          return Promise.reject(
                            new Error('Mobile number must start with 6, 7, 8, or 9!')
                          );
                        }
                        
                        // Check for common invalid patterns
                        if (/^(\d)\1{9}$/.test(cleanValue)) {
                          return Promise.reject(
                            new Error('Please enter a valid mobile number!')
                          );
                        }
                        
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    type="tel"
                    onChange={(e) => {
                      // Only allow digits
                      const value = e.target.value.replace(/\D/g, '');
                      form.setFieldValue('mobile', value);
                    }}
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
                    { required: true, message: 'Please enter password!' },
                    {
                      min: 6,
                      message: 'Password must be at least 6 characters!',
                    },
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
                    {
                      required: true,
                      message: 'Please confirm your password!',
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error('Passwords do not match!')
                        );
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
            <p className={styles.stepDescription}>
              Enter your organization's address details
            </p>

            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item
                  name="address1"
                  label="Address Line 1"
                  rules={[
                    { required: true, message: 'Please enter address line 1!' },
                  ]}
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
                <Form.Item name="address2" label="Address Line 2">
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
                  rules={[{ required: true, message: 'Please enter city!' }]}
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
                  rules={[{ required: true, message: 'Please enter state!' }]}
                >
                  <Input placeholder="Enter state" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="pincode"
                  label="Pincode"
                  rules={[
                    { required: true, message: 'Please enter pincode!' },
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.resolve();
                        }
                        
                        // Remove any non-digit characters
                        const cleanValue = value.replace(/\D/g, '');
                        
                        // Check if it's exactly 6 digits
                        if (cleanValue.length !== 6) {
                          return Promise.reject(
                            new Error('Pincode must be exactly 6 digits!')
                          );
                        }
                        
                        // Check if it starts with valid first digit (1-9)
                        if (!/^[1-9]/.test(cleanValue)) {
                          return Promise.reject(
                            new Error('Pincode must start with digits 1-9!')
                          );
                        }
                        
                        // Check for common invalid patterns
                        if (/^(\d)\1{5}$/.test(cleanValue)) {
                          return Promise.reject(
                            new Error('Please enter a valid pincode!')
                          );
                        }
                        
                        // Additional validation for specific invalid patterns
                        if (cleanValue === '000000' || cleanValue === '123456' || cleanValue === '654321') {
                          return Promise.reject(
                            new Error('Please enter a valid pincode!')
                          );
                        }
                        
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    onChange={(e) => {
                      // Only allow digits
                      const value = e.target.value.replace(/\D/g, '');
                      form.setFieldValue('pincode', value);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Review & Submit</h3>
            <p className={styles.stepDescription}>
              Review your information and create your account
            </p>

            <div className={styles.reviewSection}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className={styles.reviewCard}>
                    <h4>Basic Information</h4>
                    <p>
                      <strong>Contact:</strong>{' '}
                      {form.getFieldValue('contact_name') || 'Not filled'}
                    </p>
                    <p>
                      <strong>Organization:</strong>{' '}
                      {form.getFieldValue('organization_name') || 'Not filled'}
                    </p>
                    <p>
                      <strong>Email:</strong>{' '}
                      {form.getFieldValue('email') || 'Not filled'}
                    </p>
                    <p>
                      <strong>Mobile:</strong>{' '}
                      {form.getFieldValue('mobile') || 'Not filled'}
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className={styles.reviewCard}>
                    <h4>Address Information</h4>
                    <p>
                      <strong>Address:</strong>{' '}
                      {form.getFieldValue('address1') || 'Not filled'}
                    </p>
                    {form.getFieldValue('address2') && (
                      <p>
                        <strong>Address 2:</strong>{' '}
                        {form.getFieldValue('address2')}
                      </p>
                    )}
                    <p>
                      <strong>City:</strong>{' '}
                      {form.getFieldValue('city') || 'Not filled'}
                    </p>
                    <p>
                      <strong>State:</strong>{' '}
                      {form.getFieldValue('state') || 'Not filled'}
                    </p>
                    <p>
                      <strong>Pincode:</strong>{' '}
                      {form.getFieldValue('pincode') || 'Not filled'}
                    </p>
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
    <div className={styles.pageWrapper}>
      <LandingPageHeader showBackButton={true} />

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
                 preserve={true}
               >
                <div className={styles.stepWrapper}>
                  {/* Always render all form fields, but only show current step */}
                  <div
                    style={{ display: currentStep === 0 ? 'block' : 'none' }}
                  >
                    {renderStepContent(0)}
                  </div>
                  <div
                    style={{ display: currentStep === 1 ? 'block' : 'none' }}
                  >
                    {renderStepContent(1)}
                  </div>
                  <div
                    style={{ display: currentStep === 2 ? 'block' : 'none' }}
                  >
                    {renderStepContent(2)}
                  </div>
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
                      onClick={() => navigate('/')}
                      htmlType="button"
                    >
                      Cancel
                    </Button>

                    {currentStep < steps.length - 1 ? (
                      <Button
                        type="primary"
                        size="large"
                        className={styles.nextButton}
                        onClick={e => nextStep(e)}
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
                    Already have an account?{' '}
                    <a
                      onClick={() => navigate('/billing_login')}
                      className={styles.loginLink}
                    >
                      Sign in here
                    </a>
                  </p>
                </div>
              </Form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantSignup;
