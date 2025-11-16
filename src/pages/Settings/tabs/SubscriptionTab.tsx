import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Alert,
  Row,
  Col,
  Typography,
  Tag,
  Divider,
  Switch,
  Spin,
  message,
  Progress,
  Tooltip,
} from 'antd';
import {
  CrownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  StarOutlined,
  GoldOutlined,
  PhoneOutlined,
  MailOutlined,
  WarningOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import styles from '../Settings.module.css';
import { 
  useGetSubscriptionStatusQuery, 
  useGetMyPlanLimitsQuery, 
  UsageLimits, 
  CurrentUsage,
  PlanLimitsResponse 
} from '../../../services/redux/api/endpoints';
import { isSuperAdmin } from '../../../helpers/permissionHelper';
import { 
  calculateDaysRemaining, 
  getSubscriptionMessage,
  calculateUsagePercentage,
  getProgressColor,
  formatLabel,
  getNearLimitItems,
  processSubscriptionStatus
} from '../../../utils/subscriptionUtils';

const { Title, Text, Paragraph } = Typography;

// Pricing configuration (same as PricingPage)
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
    icon: <RocketOutlined />,
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
    icon: <StarOutlined />,
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
    icon: <CrownOutlined />,
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
    icon: <GoldOutlined />,
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
    icon: <CheckCircleOutlined />,
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

// Helper functions are now imported from subscriptionUtils

const SubscriptionTab: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  
  // Use RTK Query to fetch subscription data
  // These queries are only triggered when this component mounts (when user navigates to this tab)
  const { 
    data: subscriptionData, 
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription 
  } = useGetSubscriptionStatusQuery(undefined, { skip: isSuperAdmin() });
  
  const { 
    data: planLimitsData, 
    isLoading: isLoadingLimits,
    error: limitsError,
    refetch: refetchLimits 
  } = useGetMyPlanLimitsQuery(undefined, { skip: isSuperAdmin() });

  const loading = isLoadingSubscription || isLoadingLimits;
  
  // Process subscription status
  const subscriptionInfo = subscriptionData ? {
    ...processSubscriptionStatus(subscriptionData),
    limits: (planLimitsData as PlanLimitsResponse)?.result?.limits,
    currentUsage: (planLimitsData as PlanLimitsResponse)?.result?.current_usage,
  } : null;

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchSubscription(), refetchLimits()]);
      message.success('Subscription information refreshed');
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      message.error('Failed to refresh subscription information');
    }
  };

  const handleContactSales = (planName: string) => {
    message.info(`To upgrade to ${planName} plan, please contact our sales team.`);
    // You can add email/phone logic here
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 20 }}>Loading subscription information...</p>
      </div>
    );
  }

  return (
    <div className={styles.settingsForm}>
      {/* Current Plan Section */}
      <div className={styles.sectionTitle}>
        <CrownOutlined />
        Current Subscription
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
          size="small"
          style={{ marginLeft: 'auto' }}
        >
          Refresh
        </Button>
      </div>

      {/* Subscription Status Alert */}
      {subscriptionInfo && (
        <>
          {!subscriptionInfo.isActive ? (
            <Alert
              message="Subscription Inactive"
              description={subscriptionInfo.message || 'Your subscription has expired. Please renew to continue using the service.'}
              type="error"
              icon={<WarningOutlined />}
              showIcon
              style={{ 
                marginBottom: 24,
                borderRadius: 12,
                border: '2px solid #ff4d4f'
              }}
              action={
                <Button type="primary" danger size="small" onClick={() => handleContactSales('Renew')}>
                  Renew Now
                </Button>
              }
            />
          ) : subscriptionInfo.daysRemaining && subscriptionInfo.daysRemaining <= 7 ? (
            <Alert
              message="Subscription Expiring Soon"
              description={`Your subscription will expire in ${subscriptionInfo.daysRemaining} days. Please renew to avoid service interruption.`}
              type="warning"
              icon={<ClockCircleOutlined />}
              showIcon
              style={{ 
                marginBottom: 24,
                borderRadius: 12,
                border: '2px solid #faad14'
              }}
              action={
                <Button type="primary" size="small" onClick={() => handleContactSales('Renew')}>
                  Renew Now
                </Button>
              }
            />
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
              border: '2px solid #52c41a',
              borderRadius: 16,
              padding: '24px 28px',
              marginBottom: 24,
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
                flexShrink: 0
              }}>
                <CheckCircleOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={4} style={{ margin: '0 0 4px 0', color: '#135200' }}>
                  Subscription Active
                </Title>
                <Text style={{ fontSize: 15, color: '#389e0d' }}>
                  {getSubscriptionMessage(
                    subscriptionInfo.isActive,
                    subscriptionInfo.daysRemaining,
                    subscriptionInfo.expiryDate
                  )}
                </Text>
              </div>
            </div>
          )}

          {/* Current Plan Details */}
          <Card 
            style={{ 
              marginBottom: 30,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f6f8fa 0%, #fafbfc 100%)',
                  borderRadius: 12,
                  height: '100%',
                  border: '1px solid #e8e8e8'
                }}>
                  <Text type="secondary" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                    Current Plan
                  </Text>
                  <Title level={3} style={{ margin: '12px 0 0 0', color: '#1890ff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CrownOutlined />
                    {subscriptionInfo.planName?.charAt(0).toUpperCase() + (subscriptionInfo.planName?.slice(1) || 'Standard')}
                  </Title>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
                  borderRadius: 12,
                  height: '100%',
                  border: '1px solid #91d5ff'
                }}>
                  <Text type="secondary" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                    Status
                  </Text>
                  <div style={{ marginTop: 12 }}>
                    {subscriptionInfo.isActive ? (
                      <Tag 
                        color="success" 
                        icon={<CheckCircleOutlined />}
                        style={{ 
                          padding: '6px 16px',
                          fontSize: 15,
                          borderRadius: 8,
                          fontWeight: 500,
                          border: 'none'
                        }}
                      >
                        Active
                      </Tag>
                    ) : (
                      <Tag 
                        color="error" 
                        icon={<ClockCircleOutlined />}
                        style={{ 
                          padding: '6px 16px',
                          fontSize: 15,
                          borderRadius: 8,
                          fontWeight: 500,
                          border: 'none'
                        }}
                      >
                        Expired
                      </Tag>
                    )}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)',
                  borderRadius: 12,
                  height: '100%',
                  border: '1px solid #ffe58f'
                }}>
                  <Text type="secondary" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                    Valid Until
                  </Text>
                  <Title level={3} style={{ margin: '12px 0 0 0', color: '#fa8c16', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ClockCircleOutlined />
                    {subscriptionInfo.expiryDate 
                      ? new Date(subscriptionInfo.expiryDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : 'N/A'}
                  </Title>
                </div>
              </Col>
            </Row>
            
            {/* Days Remaining Badge */}
            {subscriptionInfo.daysRemaining !== undefined && subscriptionInfo.daysRemaining > 7 && (
              <div style={{ 
                marginTop: 24, 
                padding: '16px 20px',
                background: 'linear-gradient(90deg, #f6ffed 0%, #f0f9ff 100%)',
                borderRadius: 12,
                border: '1px solid #d9f7be',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                <Text style={{ fontSize: 15, fontWeight: 500, color: '#389e0d' }}>
                  {subscriptionInfo.daysRemaining} days remaining
                </Text>
              </div>
            )}
          </Card>

          {/* Usage Limits Section */}
          {subscriptionInfo.limits && subscriptionInfo.currentUsage && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RocketOutlined style={{ color: '#1890ff' }} />
                  <span>Plan Usage & Limits</span>
                </div>
              }
              style={{ 
                marginBottom: 30,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #f0f0f0'
              }}
              bodyStyle={{ padding: '24px 32px' }}
            >
              <Row gutter={[24, 24]}>
                {/* Users */}
                {subscriptionInfo.limits.max_users !== undefined && (
                  <Col xs={24} sm={12}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>
                          {formatLabel('users')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {subscriptionInfo.currentUsage.users || 0} / {subscriptionInfo.limits.max_users}
                        </Text>
                      </div>
                      <Tooltip 
                        title={`${calculateUsagePercentage(
                          subscriptionInfo.currentUsage.users,
                          subscriptionInfo.limits.max_users
                        )}% used`}
                      >
                        <Progress
                          percent={calculateUsagePercentage(
                            subscriptionInfo.currentUsage.users,
                            subscriptionInfo.limits.max_users
                          )}
                          strokeColor={getProgressColor(
                            calculateUsagePercentage(
                              subscriptionInfo.currentUsage.users,
                              subscriptionInfo.limits.max_users
                            )
                          )}
                          status="active"
                          strokeWidth={12}
                          style={{ marginBottom: 0 }}
                        />
                      </Tooltip>
                    </div>
                  </Col>
                )}

                {/* Organisations */}
                {subscriptionInfo.limits.max_organisations !== undefined && (
                  <Col xs={24} sm={12}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>
                          {formatLabel('organisations')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {subscriptionInfo.currentUsage.organisations || 0} / {subscriptionInfo.limits.max_organisations}
                        </Text>
                      </div>
                      <Tooltip 
                        title={`${calculateUsagePercentage(
                          subscriptionInfo.currentUsage.organisations,
                          subscriptionInfo.limits.max_organisations
                        )}% used`}
                      >
                        <Progress
                          percent={calculateUsagePercentage(
                            subscriptionInfo.currentUsage.organisations,
                            subscriptionInfo.limits.max_organisations
                          )}
                          strokeColor={getProgressColor(
                            calculateUsagePercentage(
                              subscriptionInfo.currentUsage.organisations,
                              subscriptionInfo.limits.max_organisations
                            )
                          )}
                          status="active"
                          strokeWidth={12}
                          style={{ marginBottom: 0 }}
                        />
                      </Tooltip>
                    </div>
                  </Col>
                )}

                {/* Branches */}
                {subscriptionInfo.limits.max_branches !== undefined && (
                  <Col xs={24} sm={12}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>
                          {formatLabel('branches')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {subscriptionInfo.currentUsage.branches || 0} / {subscriptionInfo.limits.max_branches}
                        </Text>
                      </div>
                      <Tooltip 
                        title={`${calculateUsagePercentage(
                          subscriptionInfo.currentUsage.branches,
                          subscriptionInfo.limits.max_branches
                        )}% used`}
                      >
                        <Progress
                          percent={calculateUsagePercentage(
                            subscriptionInfo.currentUsage.branches,
                            subscriptionInfo.limits.max_branches
                          )}
                          strokeColor={getProgressColor(
                            calculateUsagePercentage(
                              subscriptionInfo.currentUsage.branches,
                              subscriptionInfo.limits.max_branches
                            )
                          )}
                          status="active"
                          strokeWidth={12}
                          style={{ marginBottom: 0 }}
                        />
                      </Tooltip>
                    </div>
                  </Col>
                )}

                {/* Customers */}
                {subscriptionInfo.limits.max_customers !== undefined && (
                  <Col xs={24} sm={12}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>
                          {formatLabel('customers')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {subscriptionInfo.currentUsage.customers || 0} / {subscriptionInfo.limits.max_customers}
                        </Text>
                      </div>
                      <Tooltip 
                        title={`${calculateUsagePercentage(
                          subscriptionInfo.currentUsage.customers,
                          subscriptionInfo.limits.max_customers
                        )}% used`}
                      >
                        <Progress
                          percent={calculateUsagePercentage(
                            subscriptionInfo.currentUsage.customers,
                            subscriptionInfo.limits.max_customers
                          )}
                          strokeColor={getProgressColor(
                            calculateUsagePercentage(
                              subscriptionInfo.currentUsage.customers,
                              subscriptionInfo.limits.max_customers
                            )
                          )}
                          status="active"
                          strokeWidth={12}
                          style={{ marginBottom: 0 }}
                        />
                      </Tooltip>
                    </div>
                  </Col>
                )}

                {/* Products */}
                {subscriptionInfo.limits.max_products !== undefined && (
                  <Col xs={24} sm={12}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>
                          {formatLabel('products')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {subscriptionInfo.currentUsage.products || 0} / {subscriptionInfo.limits.max_products}
                        </Text>
                      </div>
                      <Tooltip 
                        title={`${calculateUsagePercentage(
                          subscriptionInfo.currentUsage.products,
                          subscriptionInfo.limits.max_products
                        )}% used`}
                      >
                        <Progress
                          percent={calculateUsagePercentage(
                            subscriptionInfo.currentUsage.products,
                            subscriptionInfo.limits.max_products
                          )}
                          strokeColor={getProgressColor(
                            calculateUsagePercentage(
                              subscriptionInfo.currentUsage.products,
                              subscriptionInfo.limits.max_products
                            )
                          )}
                          status="active"
                          strokeWidth={12}
                          style={{ marginBottom: 0 }}
                        />
                      </Tooltip>
                    </div>
                  </Col>
                )}

                {/* Sales Records */}
                {subscriptionInfo.limits.max_sales_records !== undefined && (
                  <Col xs={24} sm={12}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>
                          {formatLabel('sales_records')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {subscriptionInfo.currentUsage.sales_records || 0} / {subscriptionInfo.limits.max_sales_records}
                        </Text>
                      </div>
                      <Tooltip 
                        title={`${calculateUsagePercentage(
                          subscriptionInfo.currentUsage.sales_records,
                          subscriptionInfo.limits.max_sales_records
                        )}% used`}
                      >
                        <Progress
                          percent={calculateUsagePercentage(
                            subscriptionInfo.currentUsage.sales_records,
                            subscriptionInfo.limits.max_sales_records
                          )}
                          strokeColor={getProgressColor(
                            calculateUsagePercentage(
                              subscriptionInfo.currentUsage.sales_records,
                              subscriptionInfo.limits.max_sales_records
                            )
                          )}
                          status="active"
                          strokeWidth={12}
                          style={{ marginBottom: 0 }}
                        />
                      </Tooltip>
                    </div>
                  </Col>
                )}

                {/* Entities */}
                {subscriptionInfo.limits.max_entities !== undefined && (
                  <Col xs={24} sm={12}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>
                          {formatLabel('entities')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {subscriptionInfo.currentUsage.entities || 0} / {subscriptionInfo.limits.max_entities}
                        </Text>
                      </div>
                      <Tooltip 
                        title={`${calculateUsagePercentage(
                          subscriptionInfo.currentUsage.entities,
                          subscriptionInfo.limits.max_entities
                        )}% used`}
                      >
                        <Progress
                          percent={calculateUsagePercentage(
                            subscriptionInfo.currentUsage.entities,
                            subscriptionInfo.limits.max_entities
                          )}
                          strokeColor={getProgressColor(
                            calculateUsagePercentage(
                              subscriptionInfo.currentUsage.entities,
                              subscriptionInfo.limits.max_entities
                            )
                          )}
                          status="active"
                          strokeWidth={12}
                          style={{ marginBottom: 0 }}
                        />
                      </Tooltip>
                    </div>
                  </Col>
                )}

                {/* Custom Fields */}
                {subscriptionInfo.limits.max_custom_fields !== undefined && (
                  <Col xs={24} sm={12}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>
                          {formatLabel('custom_fields')}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {subscriptionInfo.currentUsage.entities || 0} / {subscriptionInfo.limits.max_custom_fields}
                        </Text>
                      </div>
                      <Tooltip 
                        title={`${calculateUsagePercentage(
                          subscriptionInfo.currentUsage.entities,
                          subscriptionInfo.limits.max_custom_fields
                        )}% used`}
                      >
                        <Progress
                          percent={calculateUsagePercentage(
                            subscriptionInfo.currentUsage.entities,
                            subscriptionInfo.limits.max_custom_fields
                          )}
                          strokeColor={getProgressColor(
                            calculateUsagePercentage(
                              subscriptionInfo.currentUsage.entities,
                              subscriptionInfo.limits.max_custom_fields
                            )
                          )}
                          status="active"
                          strokeWidth={12}
                          style={{ marginBottom: 0 }}
                        />
                      </Tooltip>
                    </div>
                  </Col>
                )}
              </Row>

              {/* Warning for limits near exceeded */}
              {(() => {
                const nearLimitItems = getNearLimitItems(subscriptionInfo.limits, subscriptionInfo.currentUsage);

                if (nearLimitItems.length > 0) {
                  return (
                    <Alert
                      type="warning"
                      message="Approaching Limits"
                      description={`You are approaching or have exceeded limits for: ${nearLimitItems.join(', ')}. Consider upgrading your plan.`}
                      showIcon
                      style={{ marginTop: 24, borderRadius: 8 }}
                      action={
                        <Button size="small" type="primary" onClick={() => handleContactSales('Upgrade')}>
                          Upgrade Plan
                        </Button>
                      }
                    />
                  );
                }
                return null;
              })()}
            </Card>
          )}
        </>
      )}

      <Divider />

      {/* Pricing Plans Section */}
      <div className={styles.sectionTitle}>
        <StarOutlined />
        Available Plans
      </div>

      <div className={styles.infoBox}>
        Choose the perfect plan for your business. Contact our sales team to upgrade or change your plan.
      </div>

      {/* Annual/Monthly Toggle */}
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <Space size="middle">
          <Text strong>Monthly</Text>
          <Switch
            checked={isAnnual}
            onChange={setIsAnnual}
            checkedChildren="Annual"
            unCheckedChildren="Monthly"
          />
          <Text strong>Annual</Text>
          {DISCOUNT_PERCENTAGE > 0 && (
            <Tag color="green">Save {DISCOUNT_PERCENTAGE}%</Tag>
          )}
        </Space>
      </div>

      {/* Pricing Cards */}
      <Row gutter={[16, 16]}>
        {pricingPlans.map((plan, index) => {
          const isCurrentPlan = subscriptionInfo?.planName?.toLowerCase() === plan.name.toLowerCase();
          
          return (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable={!isCurrentPlan}
                style={{
                  height: '100%',
                  borderColor: plan.popular ? '#52c41a' : undefined,
                  borderWidth: plan.popular ? 2 : 1,
                  opacity: isCurrentPlan ? 0.8 : 1,
                }}
                bodyStyle={{ padding: 24 }}
              >
                {plan.popular && (
                  <Tag color="green" style={{ position: 'absolute', top: -10, right: 10 }}>
                    Most Popular
                  </Tag>
                )}
                {isCurrentPlan && (
                  <Tag color="blue" style={{ position: 'absolute', top: -10, right: 10 }}>
                    Current Plan
                  </Tag>
                )}

                {/* Plan Header */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{
                    width: 50,
                    height: 50,
                    margin: '0 auto 15px',
                    background: plan.color,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    color: 'white'
                  }}>
                    {plan.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 8 }}>{plan.name}</Title>
                  <Text type="secondary">{plan.description}</Text>
                </div>

                {/* Pricing */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  {plan.monthlyPrice !== null ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: 700, color: plan.color }}>
                          ₹{isAnnual ? plan.annualPrice : plan.monthlyPrice}
                        </Text>
                        <Text type="secondary" style={{ marginLeft: 5 }}>
                          /{isAnnual ? 'year' : 'month'}
                        </Text>
                      </div>
                      {DISCOUNT_PERCENTAGE > 0 && (
                        <Text delete type="secondary" style={{ fontSize: 14 }}>
                          ₹{isAnnual ? (plan as any).originalAnnualPrice : (plan as any).originalMonthlyPrice}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text strong style={{ fontSize: 24, color: plan.color }}>
                      Contact Sales
                    </Text>
                  )}
                </div>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20 }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{ padding: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8, marginTop: 4 }} />
                      <Text>{feature}</Text>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <Button
                  type={plan.popular ? 'primary' : 'default'}
                  block
                  size="large"
                  disabled={isCurrentPlan}
                  onClick={() => handleContactSales(plan.name)}
                  style={{ 
                    background: !isCurrentPlan && plan.popular ? plan.color : undefined,
                    borderColor: plan.color 
                  }}
                >
                  {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Divider />

      {/* Contact Section */}
      <Card style={{ marginTop: 30, background: '#f0f2f5' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={4}>Need Help Choosing a Plan?</Title>
          <Paragraph>
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

export default SubscriptionTab;

