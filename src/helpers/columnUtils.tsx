import React from 'react';
import { Tag, Space } from 'antd';
import { CrudColumn } from '../components/common/GenericCrudPage';
import { FieldMetadata } from '../hooks/useFieldMetadata';

/**
 * Generate table columns from field metadata
 * @param fields Array of field metadata
 * @param visibleColumns Array of column keys that should be visible
 * @returns Array of CrudColumn objects
 */
export const generateColumnsFromMetadata = (
  fields: FieldMetadata[],
  visibleColumns: string[] = []
): CrudColumn[] => {
  if (!fields || fields.length === 0) return [];

  return fields
    .filter(field => visibleColumns.includes(field.field_name))
    .map(field => ({
      title: field.label,
      dataIndex: ['custom_data', field.field_name], // Access nested custom_data
      key: field.field_name,
      render: (value: any, record: any) => {
        // Get value from custom_data object
        const actualValue = record?.custom_data?.[field.field_name];
        
        if (actualValue === null || actualValue === undefined || actualValue === '') {
          return <span style={{ color: '#999' }}>-</span>;
        }

        // Handle different field types
        switch (field.field_type) {
          case 'select':
          case 'radio':
            // For select/radio, display the selected option
            return <Tag color="blue">{String(actualValue)}</Tag>;
          
          case 'checkbox':
            // For checkbox, display boolean state
            return (
              <Tag color={actualValue ? 'green' : 'red'}>
                {actualValue ? 'Yes' : 'No'}
              </Tag>
            );
          
          case 'date':
            // For date fields, format the date
            try {
              const date = new Date(actualValue);
              return (
                <span style={{ fontSize: '13px', color: '#666' }}>
                  {date.toLocaleDateString()}
                </span>
              );
            } catch {
              return <span>{String(actualValue)}</span>;
            }
          
          case 'number':
          case 'currency':
            // For number/currency fields, format with proper styling
            return (
              <span style={{ 
                fontFamily: 'monospace', 
                fontWeight: 500,
                color: field.field_type === 'currency' ? '#52c41a' : '#1890ff'
              }}>
                {field.field_type === 'currency' ? `$${Number(actualValue).toFixed(2)}` : Number(actualValue).toLocaleString()}
              </span>
            );
          
          case 'textarea':
          case 'text':
          default:
            // For text fields, truncate long text
            const text = String(actualValue);
            if (text.length > 50) {
              return (
                <span title={text}>
                  {text.substring(0, 50)}...
                </span>
              );
            }
            return <span>{text}</span>;
        }
      },
    }));
};

/**
 * Get all available column options from field metadata
 * @param fields Array of field metadata
 * @returns Array of column options with key and label
 */
export const getAvailableColumns = (fields: FieldMetadata[]) => {
  return fields.map(field => ({
    key: field.field_name,
    label: field.label,
    fieldType: field.field_type,
  }));
};

/**
 * Get default visible columns (first 5 fields by display_order)
 * @param fields Array of field metadata
 * @returns Array of column keys
 */
export const getDefaultVisibleColumns = (fields: FieldMetadata[]): string[] => {
  return fields
    .slice(0, 5) // Take first 5 fields
    .map(field => field.field_name);
};
