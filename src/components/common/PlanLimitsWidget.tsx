/**
 * PlanLimitsWidget Component
 * 
 * Displays tenant plan limits and usage information.
 * Can be used in Settings page, Dashboard, or Billing page.
 * 
 * @example
 * ```tsx
 * import PlanLimitsWidget from '../../components/common/PlanLimitsWidget';
 * 
 * <PlanLimitsWidget />
 * ```
 */

import React from 'react';
import { Card, Progress, Alert, Spin, Row, Col, Typography, Button, Tag, Divider } from 'antd';
import { 
  TeamOutlined, 
  ShopOutlined, 
  UserOutlined, 
  AppstoreOutlined,
  ReloadOutlined,
  CrownOutlined 
} from '@ant-design/icons';
import usePlanLimits from '../../hooks/usePlanLimits';

const { Title, Text, Paragraph } = Typography;

interface PlanLimitsWidgetProps {
  compact?: boolean; // Compact mode for dashboard widgets
  showRefresh?: boolean; // Show refresh button
}

const PlanLimitsWidget: React.FC<PlanLimitsWidgetProps> = ({ 
  compact = false, 
  showRefresh = true 
}) => {
  const { planLimits, loading, error, refetch, getUsagePercentage, isNearLimit } = usePlanLimits();

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 10 }}>Loading plan limits...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        message="Failed to Load Plan Limits"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={refetch}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!planLimits) {
    return null;
  }

  const resources = [
    {
      key: 'organisations',
      label: 'Organisations',
      icon: <TeamOutlined />,
      color: '#1890ff',
    },
    {
      key: 'branches',
      label: 'Branches',
      icon: <ShopOutlined />,
      color: '#52c41a',
    },
    {
      key: 'users',
      label: 'Users',
      icon: <UserOutlined />,
      color: '#722ed1',
    },
    {
      key: 'entities',
      label: 'Custom Entities',
      icon: <AppstoreOutlined />,
      color: '#fa8c16',
    },
  ] as const;

  const getStatusColor = (percentage: number): string => {
    if (percentage >= 100) return '#ff4d4f';
    if (percentage >= 80) return '#faad14';
    return '#52c41a';
  };

  const getPlanTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'free':
        return 'default';
      case 'starter':
        return 'blue';
      case 'professional':
        return 'purple';
      case 'enterprise':
        return 'gold';
      default:
        return 'default';
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <CrownOutlined style={{ marginRight: 8 }} />
            Plan & Usage
          </span>
          <div>
            <Tag color={getPlanTypeColor(planLimits.plan.type)} style={{ marginRight: 8 }}>
              {planLimits.plan.type.toUpperCase()}
            </Tag>
            {showRefresh && (
              <Button 
                type="text" 
                icon={<ReloadOutlined />} 
                onClick={refetch}
                size="small"
              />
            )}
          </div>
        </div>
      }
      size={compact ? 'small' : 'default'}
    >
      {/* Plan Status */}
      {!planLimits.plan.status && (
        <Alert
          message="Plan Inactive"
          description="Your plan is currently inactive. Please contact support or renew your subscription."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* License Expiry Warning */}
      {planLimits.plan.license_expiry && (
        <Alert
          message={`License expires on ${new Date(planLimits.plan.license_expiry).toLocaleDateString()}`}
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Usage Statistics */}
      <Row gutter={[16, 16]}>
        {resources.map((resource) => {
          const usage = planLimits.current_usage[resource.key];
          const limit = planLimits.limits[`max_${resource.key}` as keyof typeof planLimits.limits] as number;
          const percentage = getUsagePercentage(resource.key);
          const nearLimit = isNearLimit(resource.key);

          return (
            <Col xs={24} sm={12} key={resource.key}>
              <Card size="small" style={{ borderLeft: `4px solid ${resource.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 20, color: resource.color, marginRight: 8 }}>
                    {resource.icon}
                  </span>
                  <Text strong>{resource.label}</Text>
                </div>
                
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">
                    {usage} / {limit} used
                  </Text>
                </div>

                <Progress
                  percent={Math.min(percentage, 100)}
                  strokeColor={getStatusColor(percentage)}
                  status={percentage >= 100 ? 'exception' : 'normal'}
                  showInfo={!compact}
                />

                {nearLimit && !compact && (
                  <Alert
                    message={percentage >= 100 ? 'Limit reached' : 'Approaching limit'}
                    type={percentage >= 100 ? 'error' : 'warning'}
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}
              </Card>
            </Col>
          );
        })}
      </Row>

      {!compact && (
        <>
          <Divider />
          
          {/* Custom Fields Limit */}
          <div>
            <Title level={5}>Custom Field Limits</Title>
            <Paragraph type="secondary">
              Maximum custom fields per entity: {planLimits.limits.max_custom_fields_per_entity.default}
            </Paragraph>
            {Object.keys(planLimits.limits.max_custom_fields_per_entity).length > 1 && (
              <div>
                {Object.entries(planLimits.limits.max_custom_fields_per_entity)
                  .filter(([key]) => key !== 'default')
                  .map(([entity, limit]) => (
                    <Tag key={entity} color="blue" style={{ marginBottom: 4 }}>
                      {entity}: {limit}
                    </Tag>
                  ))}
              </div>
            )}
          </div>

          <Divider />

          {/* Upgrade CTA */}
          {(getUsagePercentage('branches') >= 80 || 
            getUsagePercentage('users') >= 80 || 
            getUsagePercentage('organisations') >= 80) && (
            <Alert
              message="Consider Upgrading Your Plan"
              description="You're approaching your plan limits. Upgrade to get more resources and features."
              type="info"
              showIcon
              action={
                <Button type="primary" size="small">
                  Upgrade Plan
                </Button>
              }
            />
          )}
        </>
      )}
    </Card>
  );
};

export default PlanLimitsWidget;

