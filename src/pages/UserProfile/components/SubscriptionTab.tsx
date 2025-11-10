import React, { useState } from 'react';
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Tag,
  Alert,
  Progress,
  Tooltip,
  Spin,
  Switch,
  Space,
  Divider,
  message,
} from 'antd';
import {
  CrownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import {
  UsageLimits,
  CurrentUsage,
} from '../../../services/redux/api/endpoints';
import {
  calculateUsagePercentage,
  getProgressColor,
  formatLabel,
  getSubscriptionMessage,
} from '../../../utils/subscriptionUtils';
import { PricingCard, PricingPlan } from './PricingCard';

const { Title, Text, Paragraph } = Typography;

interface SubscriptionInfo {
  isActive: boolean;
  planName: string;
  expiryDate: string | null;
  daysRemaining?: number | null;
  message?: string;
  limits?: UsageLimits;
  currentUsage?: CurrentUsage;
}

interface SubscriptionTabProps {
  subscriptionInfo: SubscriptionInfo | null;
  isLoadingSubscription: boolean;
  isLoadingLimits: boolean;
  onRefresh: () => Promise<void>;
}

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

const pricingPlans: PricingPlan[] = [
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

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  subscriptionInfo,
  isLoadingSubscription,
  isLoadingLimits,
  onRefresh,
}) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const handleContactSales = (planName: string) => {
    message.info(`To upgrade to ${planName} plan, please contact our sales team.`);
  };

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
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
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
                subscriptionInfo.daysRemaining ?? undefined,
                subscriptionInfo.expiryDate ?? undefined
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
              <PricingCard
                plan={plan}
                isAnnual={isAnnual}
                isCurrentPlan={isCurrentPlan}
                discountPercentage={DISCOUNT_PERCENTAGE}
                onContactSales={handleContactSales}
              />
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

