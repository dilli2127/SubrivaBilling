import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Descriptions,
  message,
  Space,
  Divider,
  Typography,
  Row,
  Col,
  Tag,
  Modal,
  Tabs,
  Alert,
  Progress,
  Tooltip,
  Spin,
  Switch,
  Breadcrumb,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CrownOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  ShopOutlined,
  PercentageOutlined,
  PrinterOutlined,
  BankOutlined,
  BellOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  QrcodeOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../components/antd/UserContext';
import { setUserData } from '../../helpers/auth';
import { apiSlice } from '../../services/redux/api/apiSlice';
import { 
  useGetSubscriptionStatusQuery, 
  useGetMyPlanLimitsQuery,
  UsageLimits,
  CurrentUsage,
  PlanLimitsResponse
} from '../../services/redux/api/endpoints';
import {
  processSubscriptionStatus,
  getSubscriptionMessage,
  calculateUsagePercentage,
  getProgressColor,
  formatLabel,
} from '../../utils/subscriptionUtils';
import styles from './UserProfile.module.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const UserProfile: React.FC = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  // RTK Query mutations and queries
  const [updateBillingUser, { isLoading: updateLoading }] = apiSlice.useUpdateBillingUsersMutation();
  
  // Subscription data
  const { 
    data: subscriptionData, 
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription 
  } = useGetSubscriptionStatusQuery(undefined);
  
  const { 
    data: planLimitsData, 
    isLoading: isLoadingLimits,
    refetch: refetchLimits 
  } = useGetMyPlanLimitsQuery(undefined);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        user_name: user.username || '',
      });
    }
  }, [user, form]);

  const handleUpdate = async (values: any) => {
    if (!user?._id) {
      message.error('User ID not found');
      return;
    }

    try {
      const updateData: any = {
        name: values.name,
        email: values.email,
        mobile: values.mobile,
      };

      const result = await updateBillingUser({ id: user._id, ...updateData }).unwrap();
      message.success('Profile updated successfully');
      setIsEditing(false);
      
      const userResult = (result as any)?.result || result;
      if (userResult) {
        setUserData(userResult);
      }
      
      window.location.reload();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (values: any) => {
    if (!user?._id) {
      message.error('User ID not found');
      return;
    }

    try {
      await updateBillingUser({
        id: user._id,
        password: values.new_password,
      }).unwrap();
      message.success('Password changed successfully');
      setIsChangingPassword(false);
      passwordForm.resetFields();
      window.location.reload();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to change password');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      name: user?.name,
      email: user?.email,
      mobile: user?.mobile,
      user_name: user?.username || '',
    });
  };

  const handleRefreshSubscription = async () => {
    try {
      await Promise.all([refetchSubscription(), refetchLimits()]);
      message.success('Subscription information refreshed');
    } catch (error) {
      message.error('Failed to refresh subscription information');
    }
  };

  const userRole = user?.roleItems?.name || user?.usertype || user?.user_role || 'User';
  const orgName = user?.organisationItems?.org_name || user?.organisationItems?.name || 'N/A';
  const branchName = user?.branchItems?.branch_name || user?.branchItems?.name || 'N/A';

  // Process subscription info
  const subscriptionInfo = subscriptionData ? {
    ...processSubscriptionStatus(subscriptionData),
    limits: (planLimitsData as PlanLimitsResponse)?.result?.limits,
    currentUsage: (planLimitsData as PlanLimitsResponse)?.result?.current_usage,
  } : null;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Render Account Details Tab
  const renderAccountTab = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={8}>
        <Card className={`${styles.profileCard} ${styles.profileOverview}`}>
          <div className={styles.profileAvatarSection}>
            <Avatar size={120} className={styles.profileAvatar}>
              {getInitials(user?.name)}
            </Avatar>
            <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
              {user?.name || 'User Name'}
            </Title>
            <Text type="secondary">@{user?.username || user?.name || 'username'}</Text>
            <div style={{ marginTop: 16 }}>
              <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                {userRole}
              </Tag>
            </div>
          </div>

          <Divider />

          <Descriptions column={1} size="small">
            <Descriptions.Item label={<span><IdcardOutlined /> Organisation</span>}>
              <Text strong>{orgName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><IdcardOutlined /> Branch</span>}>
              <Text strong>{branchName}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col xs={24} lg={16}>
        <Card
          className={`${styles.profileCard} ${styles.profileDetails}`}
          title="Personal Information"
          extra={
            !isEditing && (
              <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )
          }
        >
          <Form form={form} layout="vertical" onFinish={handleUpdate} disabled={!isEditing}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter your full name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Enter full name" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Username" name="user_name">
                  <Input prefix={<UserOutlined />} placeholder="Username" size="large" disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Enter a valid email' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Enter email" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Mobile Number"
                  name="mobile"
                  rules={[
                    { required: true, message: 'Please enter your mobile number' },
                    { pattern: /^[0-9]{10}$/, message: 'Enter valid 10-digit mobile number' },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Enter mobile number" maxLength={10} size="large" />
                </Form.Item>
              </Col>
            </Row>

            {isEditing && (
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updateLoading} size="large">
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} icon={<CloseOutlined />} size="large">
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            )}
          </Form>
        </Card>

        <Card className={`${styles.profileCard} ${styles.securityCard}`} title="Security Settings" style={{ marginTop: 24 }}>
          <div className={styles.securitySection}>
            <div className={styles.securityItem}>
              <LockOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div className={styles.securityItemContent}>
                <Text strong>Password</Text>
                <br />
                <Text type="secondary">Update your password to keep your account secure</Text>
              </div>
              <Button type="default" onClick={() => setIsChangingPassword(true)}>
                Change Password
              </Button>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );

  const [isAnnual, setIsAnnual] = useState(false);

  // Pricing configuration
  const DISCOUNT_PERCENTAGE = 20;
  const calculateDiscountedPrice = (originalPrice: number): number => {
    if (DISCOUNT_PERCENTAGE <= 0) return originalPrice;
    return Math.floor(originalPrice * (1 - DISCOUNT_PERCENTAGE / 100));
  };

  const originalPricingData = {
    starter: { monthly: 249, annual: 2499 },
    professional: { monthly: 699, annual: 6999 },
    business: { monthly: 999, annual: 9999 }
  };

  const pricingPlans = [
    {
      name: "Free",
      icon: "🚀",
      monthlyPrice: 0,
      annualPrice: 0,
      description: "Perfect for trying out Subriva Billing",
      features: [
        "Up to 100 invoices/month",
        "1 user account",
        "Basic reporting",
        "Email support",
        "Mobile app access"
      ],
      popular: false,
      color: "#1890ff",
    },
    {
      name: "Starter",
      icon: "⭐",
      monthlyPrice: calculateDiscountedPrice(originalPricingData.starter.monthly),
      annualPrice: calculateDiscountedPrice(originalPricingData.starter.annual),
      originalMonthlyPrice: originalPricingData.starter.monthly,
      originalAnnualPrice: originalPricingData.starter.annual,
      description: "For freelancers and small shops",
      features: [
        "Up to 500 invoices/month",
        "1 user account",
        "Custom templates",
        "Mobile app access",
        "Payment tracking & tax calculations"
      ],
      popular: false,
      color: "#faad14",
    },
    {
      name: "Professional",
      icon: "👑",
      monthlyPrice: calculateDiscountedPrice(originalPricingData.professional.monthly),
      annualPrice: calculateDiscountedPrice(originalPricingData.professional.annual),
      originalMonthlyPrice: originalPricingData.professional.monthly,
      originalAnnualPrice: originalPricingData.professional.annual,
      description: "Ideal for growing businesses",
      features: [
        "Unlimited invoices",
        "Up to 3 user accounts",
        "One Organisation",
        "One Branch",
        "Inventory management",
        "Advanced analytics & reports",
        "Automated reminders",
        "Customer portal",
        "Priority email & chat support"
      ],
      popular: true,
      color: "#52c41a",
    },
    {
      name: "Business",
      icon: "💼",
      monthlyPrice: calculateDiscountedPrice(originalPricingData.business.monthly),
      annualPrice: calculateDiscountedPrice(originalPricingData.business.annual),
      originalMonthlyPrice: originalPricingData.business.monthly,
      originalAnnualPrice: originalPricingData.business.annual,
      description: "For established businesses with teams",
      features: [
        "All Professional features",
        "Up to 5 user accounts",
        "Multi-location support",
        "Two Organisations",
        "Two Branches",
        "Advanced team collaboration",
        "Custom workflows",
        "API access & integrations",
        "Enhanced security features",
        "Priority support"
      ],
      popular: false,
      color: "#722ed1",
    },
    {
      name: "Enterprise",
      icon: "🏢",
      monthlyPrice: null,
      annualPrice: null,
      description: "For large organizations requiring advanced solutions",
      features: [
        "Unlimited users & accounts",
        "Custom integrations & development",
        "White-label solution",
        "Advanced security & compliance",
        "Dedicated support manager",
        "SLA guarantee",
        "On-premise deployment options",
        "24/7 phone support"
      ],
      popular: false,
      color: "#eb2f96",
    }
  ];

  const handleContactSales = (planName: string) => {
    message.info(`To upgrade to ${planName} plan, please contact our sales team.`);
  };

  // Render Subscription Tab
  const renderSubscriptionTab = () => {
    if (isLoadingSubscription || isLoadingLimits) {
      return (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 20 }}>Loading subscription information...</Title>
        </div>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <CrownOutlined /> Current Subscription
          </Title>
          <Button icon={<ReloadOutlined />} onClick={handleRefreshSubscription}>
            Refresh
          </Button>
        </div>

        {subscriptionInfo && (
          <>
            {/* Subscription Status Alert */}
            {!subscriptionInfo.isActive ? (
              <Alert
                message="Subscription Inactive"
                description={subscriptionInfo.message || 'Your subscription has expired.'}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
              />
            ) : subscriptionInfo.daysRemaining && subscriptionInfo.daysRemaining <= 7 ? (
              <Alert
                message="Subscription Expiring Soon"
                description={`Your subscription will expire in ${subscriptionInfo.daysRemaining} days.`}
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />
            ) : (
              <Alert
                message="Subscription Active"
                description={getSubscriptionMessage(
                  subscriptionInfo.isActive,
                  subscriptionInfo.daysRemaining,
                  subscriptionInfo.expiryDate
                )}
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {/* Current Plan Details */}
            <Card style={{ marginBottom: 24 }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Text type="secondary">Current Plan</Text>
                    <Title level={3} style={{ margin: '12px 0 0 0', color: '#1890ff' }}>
                      <CrownOutlined /> {subscriptionInfo.planName}
                    </Title>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Text type="secondary">Status</Text>
                    <div style={{ marginTop: 12 }}>
                      {subscriptionInfo.isActive ? (
                        <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 15 }}>
                          Active
                        </Tag>
                      ) : (
                        <Tag color="error" icon={<ClockCircleOutlined />} style={{ fontSize: 15 }}>
                          Expired
                        </Tag>
                      )}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Text type="secondary">Valid Until</Text>
                    <Title level={3} style={{ margin: '12px 0 0 0', color: '#fa8c16' }}>
                      {subscriptionInfo.expiryDate
                        ? new Date(subscriptionInfo.expiryDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </Title>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Usage Limits */}
            {subscriptionInfo.limits && subscriptionInfo.currentUsage && (
              <Card title="Plan Usage & Limits" style={{ marginBottom: 24 }}>
                <Row gutter={[24, 24]}>
                  {Object.keys(subscriptionInfo.limits).map((key) => {
                    const limitKey = key as keyof UsageLimits;
                    const usageKey = key.replace('max_', '') as keyof CurrentUsage;
                    const limit = subscriptionInfo.limits![limitKey];
                    const usage = subscriptionInfo.currentUsage![usageKey] || 0;

                    if (limit === undefined) return null;

                    const percentage = calculateUsagePercentage(usage, limit);

                    return (
                      <Col xs={24} sm={12} key={key}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text strong>{formatLabel(key.replace('max_', ''))}</Text>
                            <Text type="secondary">
                              {usage} / {limit}
                            </Text>
                          </div>
                          <Tooltip title={`${percentage}% used`}>
                            <Progress
                              percent={percentage}
                              strokeColor={getProgressColor(percentage)}
                              status="active"
                              strokeWidth={12}
                            />
                          </Tooltip>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            )}
          </>
        )}

        <Divider />

        {/* Available Plans Section */}
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>
            <CrownOutlined /> Available Plans
          </Title>
          <Text type="secondary">Choose the perfect plan for your business needs</Text>
        </div>

        {/* Annual/Monthly Toggle */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Space size="large">
            <Text strong style={{ fontSize: 16 }}>Monthly</Text>
            <Switch
              checked={isAnnual}
              onChange={setIsAnnual}
              checkedChildren="Annual"
              unCheckedChildren="Monthly"
              style={{ background: isAnnual ? '#52c41a' : undefined }}
            />
            <Text strong style={{ fontSize: 16 }}>Annual</Text>
            {DISCOUNT_PERCENTAGE > 0 && (
              <Tag color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
                Save {DISCOUNT_PERCENTAGE}%
              </Tag>
            )}
          </Space>
        </div>

        {/* Pricing Cards */}
        <Row gutter={[24, 24]}>
          {pricingPlans.map((plan, index) => {
            const isCurrentPlan = subscriptionInfo?.planName?.toLowerCase() === plan.name.toLowerCase();
            
            return (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  hoverable={!isCurrentPlan}
                  style={{
                    height: '100%',
                    borderColor: plan.popular ? '#52c41a' : isCurrentPlan ? '#1890ff' : undefined,
                    borderWidth: plan.popular || isCurrentPlan ? 2 : 1,
                    opacity: isCurrentPlan ? 0.95 : 1,
                    position: 'relative',
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  {plan.popular && !isCurrentPlan && (
                    <Tag color="green" style={{ position: 'absolute', top: -10, right: 10, fontWeight: 600 }}>
                      Most Popular
                    </Tag>
                  )}
                  {isCurrentPlan && (
                    <Tag color="blue" style={{ position: 'absolute', top: -10, right: 10, fontWeight: 600 }}>
                      Current Plan
                    </Tag>
                  )}

                  {/* Plan Header */}
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{
                      width: 60,
                      height: 60,
                      margin: '0 auto 16px',
                      background: plan.color,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      color: 'white'
                    }}>
                      {plan.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: 8 }}>{plan.name}</Title>
                    <Text type="secondary">{plan.description}</Text>
                  </div>

                  {/* Pricing */}
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    {plan.monthlyPrice !== null ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: 4 }}>
                          <Text style={{ fontSize: 32, fontWeight: 700, color: plan.color }}>
                            ₹{isAnnual ? plan.annualPrice : plan.monthlyPrice}
                          </Text>
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 16 }}>
                            /{isAnnual ? 'year' : 'month'}
                          </Text>
                        </div>
                        {DISCOUNT_PERCENTAGE > 0 && (plan as any).originalMonthlyPrice && (
                          <Text delete type="secondary" style={{ fontSize: 14 }}>
                            ₹{isAnnual ? (plan as any).originalAnnualPrice : (plan as any).originalMonthlyPrice}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text strong style={{ fontSize: 28, color: plan.color }}>
                        Contact Sales
                      </Text>
                    )}
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Features */}
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24, minHeight: 200 }}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} style={{ padding: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 10, marginTop: 4, fontSize: 16 }} />
                        <Text>{feature}</Text>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Button
                    type={plan.popular && !isCurrentPlan ? 'primary' : 'default'}
                    block
                    size="large"
                    disabled={isCurrentPlan}
                    onClick={() => handleContactSales(plan.name)}
                    style={{ 
                      background: !isCurrentPlan && plan.popular ? plan.color : undefined,
                      borderColor: !isCurrentPlan ? plan.color : undefined,
                      fontWeight: 600,
                      height: 48
                    }}
                  >
                    {isCurrentPlan ? '✓ Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>

        <Divider />

        {/* Contact Section */}
        <Card style={{ marginTop: 30, background: 'linear-gradient(135deg, #f6f8fa 0%, #e8edf2 100%)', border: 'none' }}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Title level={4}>
              <PhoneOutlined /> Need Help Choosing a Plan?
            </Title>
            <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
              Contact our sales team for personalized assistance and custom enterprise solutions.
            </Paragraph>
            <Space size="large">
              <Button
                type="primary"
                icon={<PhoneOutlined />}
                size="large"
                onClick={() => message.info('Phone: +91-XXXX-XXXX-XX')}
              >
                Call Sales
              </Button>
              <Button
                icon={<MailOutlined />}
                size="large"
                onClick={() => message.info('Email: sales@subrivabilling.com')}
              >
                Email Sales
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    );
  };

  // Render Settings Tab
  const renderSettingsTab = () => {
    const handleNavigateToSettings = (tabKey?: string) => {
      if (tabKey) {
        window.location.href = `#/settings?tab=${tabKey}`;
      } else {
        window.location.href = '#/settings';
      }
    };

    return (
      <Card bordered={false}>
        <div className={styles.settingsOverview}>
          {/* Main Settings Icon */}
          <div className={styles.settingsIconWrapper}>
            <SettingOutlined className={styles.settingsIcon} />
          </div>
          
          {/* Title and Description */}
          <Title level={2} className={styles.settingsTitle}>
            Application Settings
          </Title>
          <Paragraph className={styles.settingsDescription}>
            Configure your business information, tax settings, invoice templates, printer settings, and more.
          </Paragraph>
          
          {/* Settings Cards Grid */}
          <div className={styles.settingsGrid}>
            <Row gutter={[24, 24]}>
              {/* Row 1 */}
              <Col xs={24} sm={12} md={6}>
                <div className={styles.settingCard} onClick={() => handleNavigateToSettings('business')}>
                  <ShopOutlined className={styles.settingCardIcon} style={{ color: '#52c41a' }} />
                  <Title level={5} className={styles.settingCardTitle}>
                    Business Info
                  </Title>
                  <Text className={styles.settingCardSubtitle}>Company details & address</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className={styles.settingCard} onClick={() => handleNavigateToSettings('tax')}>
                  <PercentageOutlined className={styles.settingCardIcon} style={{ color: '#faad14' }} />
                  <Title level={5} className={styles.settingCardTitle}>
                    Tax & GST
                  </Title>
                  <Text className={styles.settingCardSubtitle}>Tax configuration</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className={styles.settingCard} onClick={() => handleNavigateToSettings('invoice')}>
                  <FileTextOutlined className={styles.settingCardIcon} style={{ color: '#1890ff' }} />
                  <Title level={5} className={styles.settingCardTitle}>
                    Invoice
                  </Title>
                  <Text className={styles.settingCardSubtitle}>Invoice settings & templates</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className={styles.settingCard} onClick={() => handleNavigateToSettings('printer')}>
                  <PrinterOutlined className={styles.settingCardIcon} style={{ color: '#722ed1' }} />
                  <Title level={5} className={styles.settingCardTitle}>
                    Printer
                  </Title>
                  <Text className={styles.settingCardSubtitle}>Print configuration</Text>
                </div>
              </Col>
              
              {/* Row 2 */}
              <Col xs={24} sm={12} md={6}>
                <div className={styles.settingCard} onClick={() => handleNavigateToSettings('templates')}>
                  <FileTextOutlined className={styles.settingCardIcon} style={{ color: '#096dd9' }} />
                  <Title level={5} className={styles.settingCardTitle}>
                    Templates
                  </Title>
                  <Text className={styles.settingCardSubtitle}>Bill & invoice templates</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className={styles.settingCard} onClick={() => handleNavigateToSettings('defaults')}>
                  <CheckCircleOutlined className={styles.settingCardIcon} style={{ color: '#389e0d' }} />
                  <Title level={5} className={styles.settingCardTitle}>
                    Defaults
                  </Title>
                  <Text className={styles.settingCardSubtitle}>Default values & options</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className={styles.settingCard} onClick={() => handleNavigateToSettings('bank')}>
                  <BankOutlined className={styles.settingCardIcon} style={{ color: '#eb2f96' }} />
                  <Title level={5} className={styles.settingCardTitle}>
                    Bank Details
                  </Title>
                  <Text className={styles.settingCardSubtitle}>Account & payment info</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className={styles.settingCard} onClick={() => handleNavigateToSettings('payment-qr')}>
                  <QrcodeOutlined className={styles.settingCardIcon} style={{ color: '#d46b08' }} />
                  <Title level={5} className={styles.settingCardTitle}>
                    Payment QR
                  </Title>
                  <Text className={styles.settingCardSubtitle}>UPI & QR code settings</Text>
                </div>
              </Col>
              
              {/* Row 3 */}
              <Col xs={24} sm={12} md={6}>
                <div className={styles.settingCard} onClick={() => handleNavigateToSettings('notifications')}>
                  <BellOutlined className={styles.settingCardIcon} style={{ color: '#13c2c2' }} />
                  <Title level={5} className={styles.settingCardTitle}>
                    Notifications
                  </Title>
                  <Text className={styles.settingCardSubtitle}>Email & SMS alerts</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className={styles.settingCard} onClick={() => handleNavigateToSettings('system')}>
                  <ApiOutlined className={styles.settingCardIcon} style={{ color: '#531dab' }} />
                  <Title level={5} className={styles.settingCardTitle}>
                    System
                  </Title>
                  <Text className={styles.settingCardSubtitle}>System configuration</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className={styles.settingCard} onClick={() => handleNavigateToSettings('subscription')}>
                  <CrownOutlined className={styles.settingCardIcon} style={{ color: '#c41d7f' }} />
                  <Title level={5} className={styles.settingCardTitle}>
                    Subscription
                  </Title>
                  <Text className={styles.settingCardSubtitle}>Plan & billing details</Text>
                </div>
              </Col>
            </Row>
          </div>

          {/* Open Full Settings Button */}
          <Button 
            type="primary" 
            size="large" 
            icon={<SettingOutlined />}
            onClick={() => handleNavigateToSettings()}
            className={styles.openSettingsButton}
          >
            Open Full Settings
          </Button>
        </div>
      </Card>
    );
  };

  // Render Terms & Conditions Tab
  const renderTermsTab = () => (
    <Card>
      <Title level={4}>
        <FileTextOutlined /> Terms and Conditions
      </Title>
      <Divider />
      
      <Paragraph>
        <Text strong>Last Updated:</Text> {new Date().toLocaleDateString()}
      </Paragraph>

      <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '0 10px' }}>
        <Title level={5}>1. Acceptance of Terms</Title>
        <Paragraph>
          By accessing and using Subriva Billing software, you accept and agree to be bound by the terms and provision of this agreement.
        </Paragraph>

        <Title level={5}>2. Use License</Title>
        <Paragraph>
          Permission is granted to temporarily use Subriva Billing for personal or commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:
        </Paragraph>
        <ul>
          <li>Modify or copy the materials</li>
          <li>Use the materials for any commercial purpose without proper license</li>
          <li>Attempt to decompile or reverse engineer any software contained in Subriva Billing</li>
          <li>Remove any copyright or other proprietary notations from the materials</li>
        </ul>

        <Title level={5}>3. Data Privacy</Title>
        <Paragraph>
          We are committed to protecting your privacy. All data entered into Subriva Billing is stored securely and is only accessible by authorized users within your organization.
        </Paragraph>

        <Title level={5}>4. Subscription & Payment</Title>
        <Paragraph>
          - Subscriptions are billed on a monthly or annual basis
          <br />
          - Payments are non-refundable
          <br />
          - You may cancel your subscription at any time
          <br />
          - Access to the software will be disabled upon subscription expiration
        </Paragraph>

        <Title level={5}>5. Service Availability</Title>
        <Paragraph>
          We strive to provide 99.9% uptime but do not guarantee uninterrupted access. Scheduled maintenance will be communicated in advance.
        </Paragraph>

        <Title level={5}>6. Limitation of Liability</Title>
        <Paragraph>
          In no event shall Subriva Billing or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials.
        </Paragraph>

        <Title level={5}>7. User Responsibilities</Title>
        <Paragraph>
          You are responsible for:
        </Paragraph>
        <ul>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Ensuring your use complies with applicable laws</li>
          <li>Backing up your critical data regularly</li>
        </ul>

        <Title level={5}>8. Modifications</Title>
        <Paragraph>
          We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
        </Paragraph>

        <Title level={5}>9. Termination</Title>
        <Paragraph>
          We may terminate or suspend access to our service immediately, without prior notice, for any breach of these Terms.
        </Paragraph>

        <Title level={5}>10. Contact Information</Title>
        <Paragraph>
          For questions about these Terms, please contact us at:
          <br />
          Email: support@subrivabilling.com
          <br />
          Phone: +91-XXXX-XXXX-XX
        </Paragraph>

        <Alert
          message="Agreement"
          description="By using this software, you acknowledge that you have read and understood these terms and conditions and agree to be bound by them."
          type="info"
          showIcon
          style={{ marginTop: 24 }}
        />
      </div>
    </Card>
  );

  return (
    <div className={styles.userProfileContainer}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <HomeOutlined />
            <span style={{ marginLeft: 4 }}>Home</span>
          </span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <UserOutlined />
          <span style={{ marginLeft: 4 }}>My Profile</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <div className={styles.userProfileHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 8 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            size="large"
            style={{ flexShrink: 0 }}
          >
            Back
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <UserOutlined /> My Profile
          </Title>
        </div>
        <Text type="secondary">Manage your account, subscription, and settings</Text>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        size="large"
        type="card"
        style={{ marginBottom: 24 }}
      >
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Account Details
            </span>
          }
          key="account"
        >
          {renderAccountTab()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <CrownOutlined />
              Subscription
            </span>
          }
          key="subscription"
        >
          {renderSubscriptionTab()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined />
              Settings
            </span>
          }
          key="settings"
        >
          {renderSettingsTab()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              Terms & Conditions
            </span>
          }
          key="terms"
        >
          {renderTermsTab()}
        </TabPane>
      </Tabs>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={isChangingPassword}
        onCancel={() => {
          setIsChangingPassword(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item
            label="New Password"
            name="new_password"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" size="large" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirm_password"
            dependencies={['new_password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={updateLoading} size="large">
                Update Password
              </Button>
              <Button
                onClick={() => {
                  setIsChangingPassword(false);
                  passwordForm.resetFields();
                }}
                size="large"
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;
