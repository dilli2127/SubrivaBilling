import React from 'react';
import { Button, Result, Space, Typography } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #fff5f5 100%)',
      padding: '20px'
    }}>
      <Result
        status="404"
        title={
          <Title level={1} style={{ 
            fontSize: '4rem', 
            fontWeight: 800, 
            color: '#1a1a1a',
            margin: 0,
            background: 'linear-gradient(135deg, #1890ff, #722ed1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            404
          </Title>
        }
        subTitle={
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ 
              color: '#1a1a1a', 
              fontSize: '2rem', 
              fontWeight: 600,
              margin: '16px 0'
            }}>
              Oops! Page Not Found
            </Title>
            <Paragraph style={{ 
              fontSize: '1.2rem', 
              color: '#666', 
              maxWidth: '500px',
              margin: '0 auto 32px'
            }}>
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track!
            </Paragraph>
          </div>
        }
        extra={
          <Space size="large" wrap>
            <Button
              type="primary"
              size="large"
              icon={<FileTextOutlined />}
              onClick={handleGoToDashboard}
              style={{
                background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                border: 'none',
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '8px',
                boxShadow: '0 6px 20px rgba(255, 107, 53, 0.3)'
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              size="large"
              icon={<HomeOutlined />}
              onClick={handleGoHome}
              style={{
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '2px solid #1890ff',
                color: '#1890ff'
              }}
            >
              Back to Home
            </Button>
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
              style={{
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '8px'
              }}
            >
              Go Back
            </Button>
          </Space>
        }
      >
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #1890ff, #722ed1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 25px rgba(24, 144, 255, 0.3)'
          }}>
            <SearchOutlined style={{ fontSize: '48px', color: 'white' }} />
          </div>
          
          <Title level={3} style={{ color: '#1a1a1a', marginBottom: '16px' }}>
            What can you do now?
          </Title>
          
          <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <Paragraph style={{ marginBottom: '12px' }}>
              • Check the URL for typos
            </Paragraph>
            <Paragraph style={{ marginBottom: '12px' }}>
              • Use the navigation menu to find what you need
            </Paragraph>
            <Paragraph style={{ marginBottom: '12px' }}>
              • Go back to the previous page
            </Paragraph>
            <Paragraph style={{ marginBottom: '0' }}>
              • Contact support if the problem persists
            </Paragraph>
          </div>
        </div>
      </Result>
    </div>
  );
};

export default NotFound;
