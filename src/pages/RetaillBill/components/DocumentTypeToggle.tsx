import React from 'react';
import { FileTextOutlined, PrinterOutlined } from '@ant-design/icons';
import styles from './BillDataGrid.module.css';

interface DocumentTypeToggleProps {
  value: 'bill' | 'invoice';
  onChange: (value: 'bill' | 'invoice') => void;
}

/**
 * Compact Document Type Toggle
 * Matches the style of SALE TYPE, GST, PAYMENT toggles
 */
const DocumentTypeToggle: React.FC<DocumentTypeToggleProps> = ({
  value,
  onChange,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#fff',
        padding: '6px 12px',
        borderRadius: 10,
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      }}
    >
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <FileTextOutlined style={{ fontSize: 15, color: '#667eea' }} />
        <span style={{ fontWeight: 600, fontSize: 12, color: '#333' }}>
          PRINT TYPE
        </span>
      </div>

      {/* Toggle Switch */}
      <div
        onClick={() => onChange(value === 'bill' ? 'invoice' : 'bill')}
        style={{
          position: 'relative',
          width: 100,
          height: 30,
          borderRadius: 16,
          background:
            value === 'bill'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: value === 'bill' ? 'flex-start' : 'flex-end',
          padding: '0 3px',
        }}
      >
        {/* Toggle Circle */}
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
          }}
        />

        {/* Label inside toggle */}
        <div
          style={{
            position: 'absolute',
            left: value === 'bill' ? 32 : 'auto',
            right: value === 'invoice' ? 32 : 'auto',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 10,
            letterSpacing: 0.5,
            userSelect: 'none',
          }}
        >
          {value === 'bill' ? 'BILL' : 'INVOICE'}
        </div>
      </div>
    </div>
  );
};

export default DocumentTypeToggle;
