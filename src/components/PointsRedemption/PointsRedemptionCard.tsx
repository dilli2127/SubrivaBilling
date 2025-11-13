/**
 * Points Redemption Card
 * 
 * Display customer points and allow redemption during checkout
 * Use this component in Billing page
 */

import React, { useState, useEffect } from 'react';
import { Card, InputNumber, Checkbox, Alert, Space, Statistic, Tag, Tooltip } from 'antd';
import { GiftOutlined, DollarOutlined, TrophyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useGetCustomerPointsQuery } from '../../services/redux/api/endpoints';

interface PointsRedemptionCardProps {
  customerId?: string;
  invoiceTotal: number;
  onPointsApplied: (points: number, discountValue: number) => void;
  disabled?: boolean;
}

const PointsRedemptionCard: React.FC<PointsRedemptionCardProps> = ({
  customerId,
  invoiceTotal,
  onPointsApplied,
  disabled = false,
}) => {
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  
  // Get customer points
  const { data: customerPointsData, isLoading } = useGetCustomerPointsQuery(
    customerId || '',
    { skip: !customerId }
  );
  
  const customerPoints = (customerPointsData as any)?.result || customerPointsData;
  const availablePoints = Number(customerPoints?.available_points || 0);
  const pointsValue = Number(customerPoints?.points_value || 0);
  const tier = customerPoints?.tier || 'bronze';
  
  // Calculate max redeemable points (50% of invoice)
  const maxRedeemValue = invoiceTotal * 0.5; // 50% max
  const maxRedeemPoints = Math.min(availablePoints, Math.floor(maxRedeemValue)); // 1 point = ₹1
  
  // When checkbox changes
  useEffect(() => {
    if (usePoints && maxRedeemPoints > 0) {
      // Auto-set to max redeemable
      setPointsToRedeem(maxRedeemPoints);
      onPointsApplied(maxRedeemPoints, maxRedeemPoints);
    } else {
      setPointsToRedeem(0);
      onPointsApplied(0, 0);
    }
  }, [usePoints, maxRedeemPoints]);
  
  // When points amount changes
  const handlePointsChange = (value: number | null) => {
    const points = value || 0;
    setPointsToRedeem(points);
    onPointsApplied(points, points); // 1 point = ₹1
  };
  
  // Don't show if no customer or no points
  if (!customerId || isLoading) return null;
  if (availablePoints === 0) return null;
  
  const tierColors: Record<string, string> = {
    bronze: 'default',
    silver: 'blue',
    gold: 'gold',
    platinum: 'purple',
  };
  
  return (
    <Card
      size="small"
      style={{
        background: '#fff7e6',
        borderColor: '#ffa940',
        marginBottom: 16,
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Points Balance */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <GiftOutlined style={{ fontSize: '20px', color: '#fa8c16' }} />
            <div>
              <div style={{ fontSize: '12px', color: '#888' }}>Customer Points Balance</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fa8c16' }}>
                {availablePoints} points = ₹{pointsValue.toFixed(2)}
              </div>
            </div>
          </Space>
          <Tag color={tierColors[tier]} icon={<TrophyOutlined />}>
            {tier.toUpperCase()}
          </Tag>
        </div>
        
        {/* Use Points Checkbox */}
        <Checkbox
          checked={usePoints}
          onChange={(e) => setUsePoints(e.target.checked)}
          disabled={disabled || availablePoints === 0}
        >
          <strong>Use points for discount</strong>
        </Checkbox>
        
        {/* Points Redemption Input */}
        {usePoints && (
          <>
            <div>
              <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                Points to redeem (max {maxRedeemPoints} pts):
              </div>
              <InputNumber
                min={10}
                max={maxRedeemPoints}
                value={pointsToRedeem}
                onChange={handlePointsChange}
                style={{ width: '100%' }}
                prefix={<GiftOutlined />}
                suffix="pts"
                disabled={disabled}
              />
            </div>
            
            <Alert
              message={
                <Space>
                  <DollarOutlined />
                  <span>
                    Discount: <strong>₹{pointsToRedeem.toFixed(2)}</strong>
                    {' | '}
                    Remaining points: <strong>{availablePoints - pointsToRedeem} pts</strong>
                  </span>
                </Space>
              }
              type="success"
              showIcon={false}
            />
            
            <div style={{ fontSize: '11px', color: '#888' }}>
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              Max 50% of invoice can be paid with points. 1 point = ₹1 discount.
            </div>
          </>
        )}
      </Space>
    </Card>
  );
};

export default PointsRedemptionCard;

