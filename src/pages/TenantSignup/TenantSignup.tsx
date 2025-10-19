import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
  notification,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  EditOutlined,
  WarningOutlined,
  InfoCircleOutlined,
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

// Error types for better error handling
enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  SERVER = 'server',
  CONFLICT = 'conflict',
  UNKNOWN = 'unknown',
}

// Enhanced notification helper with different types
const showNotification = (
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  description?: string,
  duration: number = 4.5
) => {
  const icons = {
    success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    error: <WarningOutlined style={{ color: '#ff4d4f' }} />,
    warning: <WarningOutlined style={{ color: '#faad14' }} />,
    info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
  };

  notification[type]({
    message,
    description,
    icon: icons[type],
    duration,
    placement: 'topRight',
    style: {
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 10000,
    },
  });
};

// Enhanced error parser
const parseError = (error: any): { type: ErrorType; message: string; statusCode?: number } => {
  // Network errors
  if (!error) {
    return {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  // Check for network error
  if (error.message?.includes('Network') || error.message?.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: 'Network error. Please check your internet connection and try again.',
    };
  }

  // Check for conflict error (duplicate email, etc.)
  if (error.statusCode === 409 || error.status === 409) {
    return {
      type: ErrorType.CONFLICT,
      message: error.message || 'This email or organization already exists. Please use different credentials.',
      statusCode: 409,
    };
  }

  // Server validation errors
  if (error.statusCode >= 400 && error.statusCode < 500) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message || 'Please check your input and try again.',
      statusCode: error.statusCode,
    };
  }

  // Server errors
  if (error.statusCode >= 500) {
    return {
      type: ErrorType.SERVER,
      message: 'Server error. Please try again later or contact support.',
      statusCode: error.statusCode,
    };
  }

  // Default error with custom message
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || 'An error occurred. Please try again.',
    statusCode: error.statusCode,
  };
};

// Input sanitization helper
const sanitizeInput = (value: string): string => {
  if (!value) return value;
  // Remove potentially dangerous characters
  return value.trim().replace(/[<>]/g, '');
};

const TenantSignup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const { loading, items, error } = useDynamicSelector('tenant_account_signup');

  // Memoized callback for server requests
  const callBackServer = useCallback(
    (variables: ApiRequest, key: string) => {
      try {
        dispatch(dynamic_request(variables, key));
      } catch (err) {
        console.error('Error dispatching request:', err);
        showNotification(
          'error',
          'Request Failed',
          'Failed to send request to server. Please try again.',
          5
        );
        setIsSubmitting(false);
      }
    },
    [dispatch]
  );

  // Memoize steps configuration to prevent unnecessary re-renders
  const steps = useMemo(
    () => [
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
    ],
    []
  );

  // Enhanced onFinish with comprehensive error handling
  const onFinish = async (values: any) => {
    try {
      // Prevent double submission
      if (isSubmitting || loading) {
        showNotification(
          'warning',
          'Please Wait',
          'Your request is already being processed.',
          3
        );
        return;
      }

      setIsSubmitting(true);
      setLastError(null);

      // Show loading notification
      const loadingKey = 'tenant_signup_loading';
      message.loading({ content: 'Creating your account...', key: loadingKey, duration: 0 });

      // Validate all steps before proceeding
      const isValid = await validateAllSteps();
      if (!isValid) {
        message.destroy(loadingKey);
        setIsSubmitting(false);
        showNotification(
          'error',
          'Validation Failed',
          'Please fill in all required fields correctly.',
          4
        );
        return;
      }

      // Get all form values from all steps
      const allFormValues = form.getFieldsValue();

      // Sanitize inputs before sending
      const processedValues = {
        contact_name: sanitizeInput(allFormValues.contact_name),
        organization_name: sanitizeInput(allFormValues.organization_name),
        email: sanitizeInput(allFormValues.email?.toLowerCase()),
        mobile: sanitizeInput(allFormValues.mobile),
        password: allFormValues.password, // Don't sanitize passwords
        address1: sanitizeInput(allFormValues.address1),
        address2: allFormValues.address2 ? sanitizeInput(allFormValues.address2) : undefined,
        city: sanitizeInput(allFormValues.city),
        state: sanitizeInput(allFormValues.state),
        pincode: sanitizeInput(allFormValues.pincode),
      };

      // Validate that passwords match one more time
      if (allFormValues.password !== allFormValues.confirmPassword) {
        message.destroy(loadingKey);
        setIsSubmitting(false);
        showNotification(
          'error',
          'Password Mismatch',
          'Passwords do not match. Please check and try again.',
          4
        );
        return;
      }

      // Call the API
      callBackServer(
        {
          method: API_ROUTES.Tenant?.Create?.method || 'POST',
          endpoint: '/tenant_accounts_signup',
          data: processedValues,
        },
        'tenant_account_signup'
      );

      message.destroy(loadingKey);
    } catch (error: any) {
      console.error('Error in onFinish:', error);
      setIsSubmitting(false);
      
      const parsedError = parseError(error);
      setLastError(parsedError.message);
      
      showNotification(
        'error',
        'Submission Failed',
        parsedError.message,
        6
      );
      
      message.destroy('tenant_signup_loading');
    }
  };

  // Enhanced useEffect with comprehensive error handling and cleanup
  useEffect(() => {
    let isSubscribed = true;

    const handleResponse = () => {
      if (!isSubscribed) return;

      try {
        // Success case
        if (items?.statusCode === 200 || items?.statusCode === 201) {
          setIsSubmitting(false);
          
          showNotification(
            'success',
            'Account Created Successfully!',
            'Your tenant account has been created. You will be redirected to the login page.',
            5
          );

          // Clear form
          form.resetFields();
          
          // Clear Redux state
          dispatch(dynamic_clear('tenant_account_signup'));

          // Delay navigation to show success message
          setTimeout(() => {
            if (isSubscribed) {
              navigate('/billing_login', { 
                state: { 
                  message: 'Account created successfully! Please log in with your credentials.' 
                } 
              });
            }
          }, 1500);
        } 
        // Error case
        else if (error) {
          setIsSubmitting(false);

          console.error('Signup error:', error);
          
          const parsedError = parseError(error);
          setLastError(parsedError.message);

          // Handle different error types
          switch (parsedError.type) {
            case ErrorType.CONFLICT:
              showNotification(
                'warning',
                'Account Already Exists',
                parsedError.message + ' Please try with different credentials or login if you already have an account.',
                7
              );
              // Navigate back to first step for conflict errors
              setCurrentStep(0);
              // Focus on email field
              setTimeout(() => form.getFieldInstance('email')?.focus(), 300);
              break;

            case ErrorType.NETWORK:
              showNotification(
                'error',
                'Network Error',
                parsedError.message + ' Please check your connection and try again.',
                6
              );
              break;

            case ErrorType.SERVER:
              showNotification(
                'error',
                'Server Error',
                parsedError.message,
                7
              );
              break;

            case ErrorType.VALIDATION:
              showNotification(
                'warning',
                'Validation Error',
                parsedError.message,
                5
              );
              // Go to first step to review inputs
              setCurrentStep(0);
              break;

            default:
              showNotification(
                'error',
                'Error',
                parsedError.message,
                5
              );
              break;
          }

          // Clear the error state after displaying
          dispatch(dynamic_clear('tenant_account_signup'));
        }
      } catch (err) {
        console.error('Error in useEffect handler:', err);
        setIsSubmitting(false);
        
        showNotification(
          'error',
          'Unexpected Error',
          'An unexpected error occurred. Please try again.',
          5
        );
      }
    };

    handleResponse();

    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, [items, error, navigate, dispatch, form]);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      const confirmLeave = window.confirm(
        'Are you sure you want to leave? All unsaved changes will be lost.'
      );
      if (confirmLeave) {
        navigate('/');
      }
    }
  }, [navigate]);

  // Enhanced nextStep with better error handling
  const nextStep = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const fieldsToValidate = getFieldsForStep(currentStep);
      
      // Validate fields for current step
      await form.validateFields(fieldsToValidate);
      
      // Show success message
      showNotification(
        'success',
        'Step Completed',
        `${steps[currentStep].title} completed successfully!`,
        2
      );
      
      // Move to next step
      setCurrentStep(prev => prev + 1);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Validation error:', error);
      
      // Find first field with error
      const firstErrorField = error?.errorFields?.[0];
      if (firstErrorField) {
        const fieldName = firstErrorField.name[0];
        const errorMessage = firstErrorField.errors[0];
        
        showNotification(
          'warning',
          'Validation Required',
          errorMessage || 'Please fill in all required fields before proceeding.',
          4
        );
        
        // Focus on the first error field
        form.getFieldInstance(fieldName)?.focus();
      } else {
        showNotification(
          'warning',
          'Validation Required',
          'Please fill in all required fields before proceeding.',
          3
        );
      }
    }
  }, [currentStep, form, steps]);

  // Enhanced validateAllSteps with detailed error reporting
  const validateAllSteps = useCallback(async (): Promise<boolean> => {
    try {
      await form.validateFields(REQUIRED_FIELDS);
      return true;
    } catch (error: any) {
      console.error('Validation error:', error);
      
      const errorFields = error?.errorFields || [];
      if (errorFields.length > 0) {
        const errorMessages = errorFields
          .map((field: any) => field.errors[0])
          .filter(Boolean)
          .slice(0, 3); // Show first 3 errors
        
        const description = errorMessages.length > 0 
          ? errorMessages.join(', ') 
          : 'Please check all fields and try again.';
        
        showNotification(
          'warning',
          `${errorFields.length} Field${errorFields.length > 1 ? 's' : ''} Need${errorFields.length === 1 ? 's' : ''} Attention`,
          description,
          5
        );
        
        // Focus on first error field
        const firstField = errorFields[0]?.name?.[0];
        if (firstField) {
          // Find which step contains this field
          const stepIndex = Object.entries({
            0: ['contact_name', 'organization_name', 'email', 'mobile', 'password', 'confirmPassword'],
            1: ['address1', 'city', 'state', 'pincode'],
          }).find(([_, fields]) => (fields as string[]).includes(firstField))?.[0];
          
          if (stepIndex !== undefined) {
            setCurrentStep(parseInt(stepIndex));
            setTimeout(() => form.getFieldInstance(firstField)?.focus(), 300);
          }
        }
      } else {
        showNotification(
          'warning',
          'Validation Required',
          'Please fill in all required fields before submitting.',
          4
        );
      }
      
      return false;
    }
  }, [form]);

  // Enhanced prevStep with confirmation
  const prevStep = useCallback(() => {
    setCurrentStep(prev => prev - 1);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showNotification(
      'info',
      'Step Changed',
      'You can review and edit previous information.',
      2
    );
  }, []);

  // Memoize field mapping for better performance
  const getFieldsForStep = useCallback((step: number): string[] => {
    const stepFields = {
      0: [
        'contact_name',
        'organization_name',
        'email',
        'mobile',
        'password',
        'confirmPassword',
      ],
      1: ['address1', 'city', 'state', 'pincode'],
    };
    return stepFields[step as keyof typeof stepFields] || [];
  }, []);

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
                            new Error(
                              'Mobile number must be exactly 10 digits!'
                            )
                          );
                        }

                        // Check if it starts with 6, 7, 8, or 9 (valid Indian mobile number prefixes)
                        if (!/^[6-9]/.test(cleanValue)) {
                          return Promise.reject(
                            new Error(
                              'Mobile number must start with 6, 7, 8, or 9!'
                            )
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
                    onChange={e => {
                      try {
                        // Only allow digits
                        const value = e.target.value.replace(/\D/g, '');
                        form.setFieldValue('mobile', value);
                      } catch (err) {
                        console.error('Error setting mobile value:', err);
                      }
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
                        if (
                          cleanValue === '000000' ||
                          cleanValue === '123456' ||
                          cleanValue === '654321'
                        ) {
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
                    onChange={e => {
                      try {
                        // Only allow digits
                        const value = e.target.value.replace(/\D/g, '');
                        form.setFieldValue('pincode', value);
                      } catch (err) {
                        console.error('Error setting pincode value:', err);
                      }
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
                        disabled={loading || isSubmitting}
                      >
                        Previous
                      </Button>
                    )}

                    <Button
                      type="default"
                      size="large"
                      className={styles.cancelButton}
                      onClick={() => {
                        const hasData = Object.values(form.getFieldsValue()).some(val => val);
                        if (hasData) {
                          const confirmLeave = window.confirm(
                            'Are you sure you want to cancel? All unsaved changes will be lost.'
                          );
                          if (confirmLeave) {
                            form.resetFields();
                            navigate('/');
                          }
                        } else {
                          navigate('/');
                        }
                      }}
                      htmlType="button"
                      disabled={loading || isSubmitting}
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
                        disabled={loading || isSubmitting}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        className={styles.submitButton}
                        loading={loading || isSubmitting}
                        disabled={loading || isSubmitting}
                        icon={!loading && !isSubmitting ? <CheckCircleOutlined /> : undefined}
                      >
                        {loading || isSubmitting ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    )}
                  </Space>
                </div>

                {/* Error display section */}
                {lastError && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '12px 16px', 
                    background: '#fff2e8',
                    border: '1px solid #ffbb96',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <WarningOutlined style={{ color: '#fa8c16' }} />
                    <span style={{ color: '#ad6800', fontSize: '14px' }}>
                      {lastError}
                    </span>
                  </div>
                )}

                <div className={styles.footer}>
                  <p>
                    Already have an account?{' '}
                    <a
                      onClick={() => navigate('/billing_login')}
                      className={styles.loginLink}
                      style={{ cursor: 'pointer' }}
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
