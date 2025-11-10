import React from 'react';
import { Card, Button, Typography, Tag, Divider } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export interface PricingPlan {
  name: string;
  icon: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  originalMonthlyPrice?: number;
  originalAnnualPrice?: number;
  description: string;
  features: string[];
  popular: boolean;
  color: string;
}

interface PricingCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
  isCurrentPlan: boolean;
  discountPercentage: number;
  onContactSales: (planName: string) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isAnnual,
  isCurrentPlan,
  discountPercentage,
  onContactSales,
}) => {
  return (
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
            {discountPercentage > 0 && plan.originalMonthlyPrice && (
              <Text delete type="secondary" style={{ fontSize: 14 }}>
                ₹{isAnnual ? plan.originalAnnualPrice : plan.originalMonthlyPrice}
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
        onClick={() => onContactSales(plan.name)}
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
  );
};

