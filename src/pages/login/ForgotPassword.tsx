import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  message,
  Divider,
  Result,
  Row,
  Col
} from 'antd';
import {
  MailOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  UserOutlined,
  LockOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import LandingPageHeader from '../../components/common/LandingPageHeader';
import styles from './ForgotPassword.module.css';

const { Title, Paragraph, Text } = Typography;

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'success' | 'reset'>('email');

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const navItems = ['back', 'email-input', 'submit-btn', 'login-link', 'features', 'pricing', 'customers', 'contact'];
        const currentFocus = document.activeElement?.getAttribute('data-nav');
        const currentIndex = navItems.indexOf(currentFocus || 'back');
        const nextIndex = (currentIndex + 1) % navItems.length;
        const nextElement = document.querySelector(`[data-nav="${navItems[nextIndex]}"]`);
        if (nextElement) {
          (nextElement as HTMLElement).focus();
        }
      }
      if (e.key === 'Enter') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.getAttribute('data-nav') === 'submit-btn') {
          handleSubmit();
        }
      }
      if (e.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const handleSubmit = async (values?: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      
      // Get form values if not provided
      const formValues = values || await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      setEmailSent(true);
      setResetStep('success');
      message.success('Password reset instructions sent to your email!');
      
    } catch (error) {
      message.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Reset instructions sent again!');
      
    } catch (error) {
      message.error('Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailForm = () => (
    <div className={styles.formContainer}>
      <Card className={styles.forgotPasswordCard}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrapper}>
            <LockOutlined className={styles.lockIcon} />
          </div>
          <Title level={2} className={styles.formTitle}>
            Forgot Password?
          </Title>
          <Paragraph className={styles.formSubtitle}>
            No worries! Enter your email address and we'll send you instructions to reset your password.
          </Paragraph>
        </div>

        <Form
          form={form}
          name="forgotPassword"
          onFinish={handleSubmit}
          layout="vertical"
          className={styles.forgotPasswordForm}
          size="large"
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email address!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email address"
              className={styles.emailInput}
              data-nav="email-input"
              tabIndex={0}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className={styles.submitButton}
              data-nav="submit-btn"
              tabIndex={0}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </Form.Item>
        </Form>

        <Divider className={styles.divider}>
          <Text type="secondary">Remember your password?</Text>
        </Divider>

        <div className={styles.loginActions}>
          <Space direction="vertical" size="large" className={styles.actionSpace}>
            {/* <Link 
              to="/login" 
              className={styles.loginLink}
              data-nav="login-link"
              tabIndex={0}
            >
              <ArrowLeftOutlined /> Back to Login
            </Link> */}
            
            <Link 
              to="/billing_login" 
              className={styles.billingLoginLink}
              tabIndex={0}
            >
              <UserOutlined /> Billing Login
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  );

  const renderSuccessMessage = () => (
    <div className={styles.formContainer}>
      <Card className={styles.forgotPasswordCard}>
        <Result
          icon={<CheckCircleOutlined className={styles.successIcon} />}
          title="Check Your Email"
          subTitle={
            <div className={styles.successContent}>
              <Paragraph>
                We've sent password reset instructions to your email address.
              </Paragraph>
              <Paragraph>
                <Text strong>Please check your inbox and follow the instructions to reset your password.</Text>
              </Paragraph>
              <Paragraph>
                <Text type="secondary">
                  Didn't receive the email? Check your spam folder or try again.
                </Text>
              </Paragraph>
            </div>
          }
          extra={[
            <Button 
              key="resend" 
              type="primary" 
              onClick={handleResendEmail}
              loading={loading}
              className={styles.resendButton}
            >
              Resend Email
            </Button>,
            <Button 
              key="back" 
              onClick={() => {
                setEmailSent(false);
                setResetStep('email');
                form.resetFields();
              }}
              className={styles.backButton}
            >
              Try Different Email
            </Button>,
            <Link key="login" to="/login" className={styles.loginLink}>
              <ArrowLeftOutlined /> Back to Login
            </Link>
          ]}
        />
      </Card>
    </div>
  );

  const securityTips = [
    {
      icon: <SafetyOutlined />,
      title: "Use a Strong Password",
      description: "Include uppercase, lowercase, numbers, and special characters"
    },
    {
      icon: <MailOutlined />,
      title: "Keep Email Secure",
      description: "Your email is your key to account recovery"
    },
    {
      icon: <UserOutlined />,
      title: "Regular Updates",
      description: "Update your password regularly for better security"
    }
  ];

  return (
    <div className={styles.forgotPasswordPage}>
      <LandingPageHeader showBackButton={true} />
      
      <div className={styles.container}>
        <div className={styles.background} />
        
        <div className={styles.content}>
          <Row justify="center" align="middle">
            <Col xs={24} sm={20} md={16} lg={12} xl={10}>
              {resetStep === 'email' && renderEmailForm()}
              {resetStep === 'success' && renderSuccessMessage()}
            </Col>
          </Row>

          {/* Security Tips Section */}
          {resetStep === 'email' && (
            <div className={styles.securityTipsSection}>
              <Title level={3} className={styles.tipsTitle}>
                Password Security Tips
              </Title>
              <Row gutter={[24, 24]} className={styles.tipsGrid}>
                {securityTips.map((tip, index) => (
                  <Col xs={24} md={8} key={index}>
                    <Card className={styles.tipCard} hoverable>
                      <div className={styles.tipContent}>
                        <div className={styles.tipIcon}>
                          {tip.icon}
                        </div>
                        <Title level={5} className={styles.tipTitle}>
                          {tip.title}
                        </Title>
                        <Paragraph className={styles.tipDescription}>
                          {tip.description}
                        </Paragraph>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
