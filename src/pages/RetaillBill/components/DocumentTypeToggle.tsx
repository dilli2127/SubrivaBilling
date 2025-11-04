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
        gap: 12,
        background: '#fff',
        padding: '8px 16px',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileTextOutlined style={{ fontSize: 18, color: '#667eea' }} />
        <span style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>
          PRINT TYPE
        </span>
      </div>

      {/* Toggle Switch */}
      <div
        onClick={() => onChange(value === 'bill' ? 'invoice' : 'bill')}
        style={{
          position: 'relative',
          width: 120,
          height: 36,
          borderRadius: 20,
          background: value === 'bill' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: value === 'bill' ? 'flex-start' : 'flex-end',
          padding: '0 4px',
        }}
      >
        {/* Toggle Circle */}
        <div
          style={{
            width: 28,
            height: 28,
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
            left: value === 'bill' ? 40 : 'auto',
            right: value === 'invoice' ? 40 : 'auto',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 12,
            letterSpacing: 0.5,
            userSelect: 'none',
          }}
        >
          {value === 'bill' ? 'BILL' : 'INVOICE'}
        </div>
      </div>

      {/* Icon indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#666' }}>
        {value === 'bill' ? (
          <>
            <PrinterOutlined style={{ fontSize: 14 }} />
            <span>Retail</span>
          </>
        ) : (
          <>
            <FileTextOutlined style={{ fontSize: 14 }} />
            <span>Formal</span>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentTypeToggle;

