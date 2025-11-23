import React from 'react';
import { Typography, InputNumber, Switch } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import styles from './BillDataGrid.module.css';

const { Text } = Typography;

interface BillSummaryProps {
  billCalculations: {
    sub_total: number;
    value_of_goods: number;
    total_gst: number;
    cgst: number;
    sgst: number;
    total_amount: number;
    discountValue: number;
  };
  billSettings: {
    discount: number;
    discountType: 'percentage' | 'amount';
    isPaid: boolean;
    isPartiallyPaid: boolean;
    paidAmount: number;
  };
  customerId?: string;
  pointsUsed?: number;
  pointsConvertedAmount?: number;
  availablePoints?: number;
  onDiscountChange: (value: number) => void;
  onDiscountTypeChange: (checked: boolean) => void;
  onPaidAmountChange: (value: number) => void;
  onPointsUsedChange?: (points: number) => void;
}

const BillSummary: React.FC<BillSummaryProps> = ({
  billCalculations,
  billSettings,
  customerId,
  pointsUsed = 0,
  pointsConvertedAmount = 0,
  availablePoints = 0,
  onDiscountChange,
  onDiscountTypeChange,
  onPaidAmountChange,
  onPointsUsedChange,
}) => {
  return (
    <div className={styles.billSummary}>
      {/* Decorative half circles for summary */}
      <div className={styles.summaryCircle1} />
      <div className={styles.summaryCircle2} />

      {/* Header */}
      <div className={styles.summaryHeader}>
        <Text className={styles.summaryTitle}>💰 BILL SUMMARY</Text>
      </div>

      {/* Summary Table */}
      <div className={styles.summaryTable}>
        <div className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>Sub Total:</Text>
          <Text className={styles.summaryValue}>
            ₹{billCalculations.sub_total.toFixed(2)}
          </Text>
        </div>

        <div className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>Value of Goods:</Text>
          <Text className={styles.summaryValue}>
            ₹{billCalculations.value_of_goods.toFixed(2)}
          </Text>
        </div>

        <div className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>Total GST:</Text>
          <Text className={styles.summaryValue}>
            ₹{billCalculations.total_gst.toFixed(2)}
          </Text>
        </div>

        <div className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>CGST:</Text>
          <Text className={styles.summaryValue}>
            ₹{billCalculations.cgst.toFixed(2)}
          </Text>
        </div>

        <div className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>SGST:</Text>
          <Text className={styles.summaryValue}>
            ₹{billCalculations.sgst.toFixed(2)}
          </Text>
        </div>

        {billSettings.discount > 0 && (
          <div className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>DISCOUNT:</Text>
            <Text className={styles.discountValue}>
              -₹
              {billSettings.discountType === 'percentage'
                ? (
                  ((billCalculations.sub_total + billCalculations.total_gst) *
                    (typeof billSettings.discount === 'number' ? billSettings.discount : 0)) /
                  100
                ).toFixed(2)
                : (typeof billSettings.discount === 'number'
                  ? billSettings.discount
                  : 0
                ).toFixed(2)}
            </Text>
          </div>
        )}

        {pointsConvertedAmount > 0 && (
          <div className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              <GiftOutlined style={{ marginRight: 4 }} />
              POINTS DISCOUNT:
            </Text>
            <Text className={styles.discountValue}>
              -₹{pointsConvertedAmount.toFixed(2)}
            </Text>
          </div>
        )}

        <div className={styles.totalAmountRow}>
          <Text className={styles.totalAmountLabel}>NET/EXC/REPL:</Text>
          <Text className={styles.totalAmountValue}>
            ₹{billCalculations.total_amount.toFixed(2)}
          </Text>
        </div>

        {billSettings.isPartiallyPaid && (
          <div className={styles.partialPaymentInfo}>
            <div className={styles.partialPaymentRow}>
              <Text className={styles.partialPaymentLabel}>Paid Amount:</Text>
              <Text className={styles.partialPaymentValue}>
                ₹
                {(typeof billSettings.paidAmount === 'number'
                  ? billSettings.paidAmount
                  : 0
                ).toFixed(2)}
              </Text>
            </div>
            <div className={styles.partialPaymentRow}>
              <Text className={styles.partialPaymentLabel}>Balance:</Text>
              <Text className={styles.partialPaymentValue}>
                ₹
                {(
                  billCalculations.total_amount -
                  (typeof billSettings.paidAmount === 'number' ? billSettings.paidAmount : 0)
                ).toFixed(2)}
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Discount & Payment Controls */}
      <div className={styles.controlsContainer}>
        {/* Discount Controls */}
        <div className={styles.discountControl}>
          <Text className={styles.discountControlLabel}>💸 DISCOUNT</Text>
          <div className={styles.discountControlInputs}>
            <InputNumber
              min={0}
              value={billSettings.discount}
              onChange={value => onDiscountChange(value || 0)}
              style={{ width: 70 }}
              size="small"
            />
            <Switch
              checkedChildren="%"
              unCheckedChildren="₹"
              checked={billSettings.discountType === 'percentage'}
              onChange={onDiscountTypeChange}
              size="small"
            />
          </div>
          {billSettings.discount > 0 && (
            <Text style={{ fontSize: '11px', color: '#10b981', marginTop: 4, display: 'block', fontWeight: 600 }}>
              Saved: ₹{billCalculations.discountValue.toFixed(2)}
            </Text>
          )}
        </div>

        {/* Points Redemption Controls */}
        {customerId && onPointsUsedChange && (
          <div className={styles.pointsControl}>
            <Text className={styles.pointsControlLabel}>
              <GiftOutlined style={{ marginRight: 4, color: '#8b5cf6' }} />
              POINTS {availablePoints > 0 ? `(${availablePoints})` : ''}
            </Text>
            <InputNumber
              min={0}
              max={availablePoints}
              value={pointsUsed}
              onChange={value => onPointsUsedChange(value || 0)}
              style={{ width: '100%' }}
              size="small"
              placeholder="0"
              step={1}
              disabled={availablePoints === 0}
            />
            {pointsUsed > 0 && (
              <Text style={{ fontSize: '11px', color: '#10b981', marginTop: 4, display: 'block', fontWeight: 600 }}>
                Saved: ₹{pointsConvertedAmount.toFixed(2)}
              </Text>
            )}
            {availablePoints === 0 && (
              <Text style={{ fontSize: '10px', color: '#94a3b8', marginTop: 4, display: 'block' }}>
                No points available
              </Text>
            )}
          </div>
        )}

        {/* Partial Payment Controls */}
        {billSettings.isPartiallyPaid && (
          <div className={styles.partialPaymentControl}>
            <Text className={styles.partialPaymentControlLabel}>💰 PARTIAL PAY</Text>
            <InputNumber
              min={0}
              max={billCalculations.total_amount}
              value={billSettings.paidAmount}
              onChange={value => onPaidAmountChange(value || 0)}
              style={{ width: 90 }}
              size="small"
              formatter={value => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => Number(value!.replace(/₹\s?|(,*)/g, ''))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BillSummary;

