import React from 'react';
import { Card, Result, Typography } from 'antd';
import {
  ExperimentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Paragraph, Text } = Typography;

const StaffReport: React.FC = () => {
  return (
    <Card 
      style={{ 
        borderRadius: 12, 
        minHeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Result
        icon={<ExperimentOutlined style={{ color: '#1890ff' }} />}
        title={<Text strong style={{ fontSize: 24 }}>Staff Performance Report</Text>}
        subTitle={
          <div style={{ marginTop: 16 }}>
            <ClockCircleOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
            <Paragraph style={{ fontSize: 16, color: '#595959' }}>
              This feature is currently under development
            </Paragraph>
            <Paragraph style={{ fontSize: 14, color: '#8c8c8c' }}>
              We're working on bringing you comprehensive staff performance analytics including:
            </Paragraph>
            <ul style={{ textAlign: 'left', display: 'inline-block', color: '#595959' }}>
              <li>Individual staff sales performance metrics</li>
              <li>Target achievement tracking</li>
              <li>Conversion rate analysis</li>
              <li>Performance comparison charts</li>
              <li>Staff productivity reports</li>
            </ul>
            <Paragraph style={{ fontSize: 14, color: '#8c8c8c', marginTop: 16 }}>
              Stay tuned for updates!
            </Paragraph>
          </div>
        }
        status="info"
      />
    </Card>
  );
};

export default StaffReport;

