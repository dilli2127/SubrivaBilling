// Reusable component for displaying masked sensitive data
import React, { useState } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Button, Tooltip, Typography, Space } from 'antd';
import { canViewSensitiveData } from '../../helpers/dataMasking';
import { getCurrentUserRole } from '../../helpers/auth';

const { Text } = Typography;

interface MaskedFieldProps {
  value: string | null | undefined;
  maskFn: (val: string) => string;
  label?: string;
  allowReveal?: boolean;
  checkPermissions?: boolean;
  style?: React.CSSProperties;
  copyable?: boolean;
}

/**
 * Component to display masked sensitive data with optional reveal
 * Usage:
 *   <MaskedField 
 *     value={user.email} 
 *     maskFn={maskEmail} 
 *     label="Email"
 *     allowReveal={true}
 *     checkPermissions={true}
 *   />
 */
const MaskedField: React.FC<MaskedFieldProps> = ({
  value,
  maskFn,
  label,
  allowReveal = true,
  checkPermissions = true,
  style,
  copyable = false
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  
  if (!value) {
    return <Text type="secondary">-</Text>;
  }

  const userRole = getCurrentUserRole();
  const hasPermission = !checkPermissions || canViewSensitiveData(userRole);
  const canReveal = allowReveal && hasPermission;

  const displayValue = isRevealed ? value : maskFn(value);

  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  return (
    <Space style={style}>
      {label && <Text strong>{label}:</Text>}
      <Text 
        copyable={copyable && isRevealed ? { text: value } : false}
        code={isRevealed}
      >
        {displayValue}
      </Text>
      {canReveal && (
        <Tooltip title={isRevealed ? 'Hide' : 'Reveal'}>
          <Button
            type="text"
            size="small"
            icon={isRevealed ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={toggleReveal}
            style={{ padding: '0 4px' }}
          />
        </Tooltip>
      )}
      {!hasPermission && allowReveal && (
        <Tooltip title="Insufficient permissions to reveal">
          <EyeInvisibleOutlined style={{ color: '#ccc', cursor: 'not-allowed' }} />
        </Tooltip>
      )}
    </Space>
  );
};

export default MaskedField;

