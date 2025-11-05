import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Switch,
  Select,
  Slider,
  Row,
  Col,
  Divider,
  Card,
  Alert,
  Typography,
  Space,
} from 'antd';
import {
  QrcodeOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import styles from '../Settings.module.css';
import { SettingsTabProps } from './types';
import { 
  generateUPIQRCode, 
  isValidUPIId, 
  getUPIAppInfo 
} from '../../../helpers/upiPayment';

const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

const PaymentQRTab: React.FC<SettingsTabProps> = ({
  form,
  loading,
  onSave,
  onReset,
}) => {
  const [qrCodePreview, setQrCodePreview] = useState<string>('');
  const [upiValid, setUpiValid] = useState<boolean>(false);
  const [upiAppInfo, setUpiAppInfo] = useState<{ provider: string; appName: string } | null>(null);
  
  // Watch form values for real-time QR preview
  const upiId = Form.useWatch('upi_id', form);
  const enablePaymentQr = Form.useWatch('enable_payment_qr', form);
  const qrSize = Form.useWatch('qr_size', form) || 200;

  // Generate QR code preview when UPI ID changes
  useEffect(() => {
    const generatePreview = async () => {
      if (!upiId || !isValidUPIId(upiId)) {
        setQrCodePreview('');
        setUpiValid(false);
        setUpiAppInfo(null);
        return;
      }

      setUpiValid(true);
      setUpiAppInfo(getUPIAppInfo(upiId));

      try {
        // Get organization name from form or use default
        const orgName = form.getFieldValue('org_name') || 'Your Business';
        
        const qrCode = await generateUPIQRCode({
          upiId: upiId,
          payeeName: orgName,
          transactionNote: 'Payment for Invoice',
        }, {
          width: qrSize,
        });
        
        setQrCodePreview(qrCode);
      } catch (error) {
        console.error('Error generating QR preview:', error);
        setQrCodePreview('');
      }
    };

    generatePreview();
  }, [upiId, qrSize, form]);

  return (
    <Form form={form} layout="vertical" className={styles.settingsForm}>
      <div className={styles.sectionTitle}>
        <QrcodeOutlined />
        Payment QR Code Settings
      </div>

      <div className={styles.infoBox}>
        <Space direction="vertical" size="small">
          <Text>
            <InfoCircleOutlined /> Enable UPI QR codes on your invoices and bills for instant digital payments
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Customers can scan the QR code with Google Pay, PhonePe, Paytm, or any UPI app
          </Text>
        </Space>
      </div>

      {/* Enable Payment QR */}
      <Form.Item
        label="Enable Payment QR Code"
        name="enable_payment_qr"
        valuePropName="checked"
        extra="Show UPI payment QR code on invoices and bills"
      >
        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
      </Form.Item>

      {/* UPI ID Field */}
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="UPI ID"
            name="upi_id"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject('Please enter your UPI ID');
                  }
                  if (!isValidUPIId(value)) {
                    return Promise.reject('Invalid UPI ID format (e.g., 1234567890@ybl)');
                  }
                  return Promise.resolve();
                },
              },
            ]}
            extra="Your UPI ID for receiving payments (e.g., 1234567890@ybl)"
          >
            <Input 
              placeholder="yourname@upi or phonenumber@ybl" 
              suffix={
                upiValid ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : null
              }
            />
          </Form.Item>
          
          {/* Show UPI Provider Info */}
          {upiAppInfo && (
            <Alert
              message={`UPI Provider: ${upiAppInfo.provider}`}
              description={`Compatible with: ${upiAppInfo.appName}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </Col>
      </Row>

      <Divider>QR Code Display Options</Divider>

      {/* Display Options */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Show on Invoices"
            name="qr_on_invoice"
            valuePropName="checked"
            extra="Display QR code on formal invoices"
          >
            <Switch 
              checkedChildren="Yes" 
              unCheckedChildren="No"
              disabled={!enablePaymentQr}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Show on Bills"
            name="qr_on_bill"
            valuePropName="checked"
            extra="Display QR code on retail bills"
          >
            <Switch 
              checkedChildren="Yes" 
              unCheckedChildren="No"
              disabled={!enablePaymentQr}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* QR Code Size */}
      <Form.Item
        label={`QR Code Size: ${qrSize}px`}
        name="qr_size"
        extra="Size of the QR code on printed documents"
      >
        <Slider
          min={100}
          max={300}
          step={10}
          marks={{
            100: '100px',
            150: '150px',
            200: '200px',
            250: '250px',
            300: '300px',
          }}
          disabled={!enablePaymentQr}
        />
      </Form.Item>

      {/* QR Position */}
      <Form.Item
        label="QR Code Position"
        name="qr_position"
        extra="Where to place the QR code on the document"
      >
        <Select disabled={!enablePaymentQr}>
          <Option value="bottom-right">Bottom Right</Option>
          <Option value="bottom-left">Bottom Left</Option>
          <Option value="top-right">Top Right (Header)</Option>
          <Option value="footer">Footer Center</Option>
        </Select>
      </Form.Item>

      {/* Show UPI ID Text */}
      <Form.Item
        label="Show UPI ID Text"
        name="show_upi_id_text"
        valuePropName="checked"
        extra="Display UPI ID below the QR code for manual entry"
      >
        <Switch 
          checkedChildren="Show" 
          unCheckedChildren="Hide"
          disabled={!enablePaymentQr}
        />
      </Form.Item>

      <Divider>QR Code Preview</Divider>

      {/* QR Code Preview */}
      <Card 
        title="Live Preview" 
        bordered={false}
        style={{ background: '#fafafa', marginBottom: 24 }}
      >
        {qrCodePreview ? (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={qrCodePreview} 
              alt="UPI QR Code Preview" 
              style={{ 
                maxWidth: '100%',
                border: '2px solid #d9d9d9',
                padding: 8,
                background: '#fff',
                borderRadius: 8,
              }}
            />
            {form.getFieldValue('show_upi_id_text') && (
              <div style={{ marginTop: 12 }}>
                <Text strong>UPI ID: </Text>
                <Text code>{upiId}</Text>
              </div>
            )}
            <Paragraph type="secondary" style={{ marginTop: 12, fontSize: '12px' }}>
              Scan this QR code with any UPI app to make payment
            </Paragraph>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <QrcodeOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
            <Paragraph type="secondary" style={{ marginTop: 12 }}>
              {upiId ? 'Generating QR code...' : 'Enter a valid UPI ID to see preview'}
            </Paragraph>
          </div>
        )}
      </Card>

      {/* Instructions */}
      <div className={styles.warningBox}>
        <Title level={5} style={{ marginTop: 0 }}>
          📱 How Customers Will Pay:
        </Title>
        <ol style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li>Customer opens Google Pay, PhonePe, Paytm, or any UPI app</li>
          <li>Taps on "Scan QR Code" or "Pay by QR"</li>
          <li>Scans the QR code printed on your invoice/bill</li>
          <li>Verifies amount and completes payment</li>
          <li>Payment instantly credited to your account</li>
        </ol>
      </div>

      <Alert
        message="Pro Tip"
        description="For best results, ensure your QR code is at least 150px in size and printed with high contrast (black on white background)."
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />

      <div className={styles.formActions}>
        <Button onClick={onReset}>Reset</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={loading}
        >
          Save QR Settings
        </Button>
      </div>
    </Form>
  );
};

export default PaymentQRTab;

