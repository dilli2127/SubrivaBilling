import React from 'react';
import { Form, Row, Col, DatePicker, Input, Select } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

interface BillFormProps {
  customerList: any;
  onAddCustomer: () => void;
}

const BillForm: React.FC<BillFormProps> = ({ customerList, onAddCustomer }) => {
  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Form.Item
            label="Date"
            name="date"
            initialValue={dayjs()}
            style={{ marginBottom: 0 }}
          >
            <DatePicker disabled style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Invoice Number"
            name="invoice_no"
            rules={[{ required: true, message: "Invoice number is required" }]}
            style={{ marginBottom: 0 }}
          >
            <Input
              placeholder="Enter invoice number"
              style={{ borderColor: "#1890ff" }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Form.Item
            label="Customer"
            name="customer"
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: "Please select a customer" }]}
          >
            <Select
              placeholder="Select Customer"
              showSearch
              allowClear
              style={{ width: "100%", borderColor: "#1890ff" }}
              optionFilterProp="children"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: 8,
                      cursor: "pointer",
                      color: "#1890ff",
                      borderTop: "1px solid #f0f0f0",
                    }}
                    onClick={onAddCustomer}
                  >
                    + Add Customer
                  </div>
                </>
              )}
            >
              {customerList?.result?.map((cust: any) => (
                <Option key={cust._id} value={cust._id}>
                  {cust.full_name} - {cust.mobile}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Payment Mode"
            name="payment_mode"
            style={{ marginBottom: 0 }}
          >
            <Select style={{ borderColor: "#1890ff" }}>
              <Option value="cash">Cash</Option>
              <Option value="upi">UPI</Option>
              <Option value="card">Card</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default BillForm; 