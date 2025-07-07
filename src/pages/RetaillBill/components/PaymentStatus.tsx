import React from 'react';
import { Form, Row, Col, Checkbox, Space, InputNumber } from 'antd';

interface PaymentStatusProps {
  isPaid: boolean;
  isPartiallyPaid: boolean;
  onPaidChange: (checked: boolean) => void;
  onPartiallyPaidChange: (checked: boolean) => void;
  total_amount: number;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  isPaid,
  isPartiallyPaid,
  onPaidChange,
  onPartiallyPaidChange,
  total_amount,
}) => {
  return (
    <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
      <Col span={24}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <Form.Item label="Payment Status" style={{ marginBottom: 8 }}>
            <Space direction="horizontal">
              <Checkbox
                checked={isPaid}
                onChange={(e) => onPaidChange(e.target.checked)}
              >
                Fully Paid
              </Checkbox>
              <Checkbox
                checked={isPartiallyPaid}
                onChange={(e) => onPartiallyPaidChange(e.target.checked)}
              >
                Partially Paid
              </Checkbox>
            </Space>
          </Form.Item>

          {isPartiallyPaid && (
            <Form.Item
              name="paid_amount"
              rules={[
                { required: true, message: "Please enter paid amount" },
                {
                  validator: (_, value) => {
                    if (value > total_amount) {
                      return Promise.reject(
                        "Paid amount cannot be greater than total amount"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              style={{ marginBottom: 0, width: "210px" }}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={total_amount}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value!.replace(/₹\s?|(,*)/g, ""))}
                placeholder="Enter paid amount"
              />
            </Form.Item>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default PaymentStatus; 