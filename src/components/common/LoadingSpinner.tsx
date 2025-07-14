import React from 'react';
import { Spin, Skeleton } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  spinning?: boolean;
  tip?: string;
  type?: 'spinner' | 'skeleton';
  rows?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  spinning = true,
  tip = 'Loading...',
  type = 'spinner',
  rows = 3,
  className = '',
}) => {
  if (type === 'skeleton') {
    return (
      <div className={className}>
        <Skeleton
          active
          paragraph={{ rows }}
          title={{ width: '60%' }}
        />
      </div>
    );
  }

  return (
    <div className={`loading-container ${className}`}>
      <Spin
        size={size}
        spinning={spinning}
        tip={tip}
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      />
    </div>
  );
};

export default LoadingSpinner; 