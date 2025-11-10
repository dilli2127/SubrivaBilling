import React from 'react';
import { Card, Typography, Divider, Alert } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export const TermsTab: React.FC = () => {
  return (
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
};

