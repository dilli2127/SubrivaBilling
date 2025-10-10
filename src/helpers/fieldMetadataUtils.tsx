import React from 'react';
import {
  Input,
  InputNumber,
  Select,
  Switch,
  DatePicker,
  Checkbox,
  Radio,
} from 'antd';
import type { Rule } from 'antd/es/form';
import { CrudFormItem } from '../components/common/GenericCrudPage';
import { FieldMetadata } from '../hooks/useFieldMetadata';

const { TextArea } = Input;

/**
 * Field type option for dropdown
 */
export interface FieldTypeOption {
  label: string;
  value: string;
  category?: 'text' | 'number' | 'choice' | 'date' | 'other';
}

/**
 * Get field type options for dropdown (categorized)
 */
export const FIELD_TYPE_OPTIONS: FieldTypeOption[] = [
  // Text inputs
  { label: 'Text', value: 'text', category: 'text' },
  { label: 'Text Area', value: 'textarea', category: 'text' },
  { label: 'Email', value: 'email', category: 'text' },
  { label: 'Phone', value: 'phone', category: 'text' },
  { label: 'URL', value: 'url', category: 'text' },
  { label: 'Password', value: 'password', category: 'text' },
  
  // Numbers
  { label: 'Number (Integer)', value: 'number', category: 'number' },
  { label: 'Decimal', value: 'decimal', category: 'number' },
  
  // Choices
  { label: 'Boolean (Yes/No)', value: 'boolean', category: 'choice' },
  { label: 'Checkbox', value: 'checkbox', category: 'choice' },
  { label: 'Select (Dropdown)', value: 'select', category: 'choice' },
  { label: 'Multi-Select', value: 'multiselect', category: 'choice' },
  { label: 'Radio Buttons', value: 'radio', category: 'choice' },
  
  // Date/Time
  { label: 'Date', value: 'date', category: 'date' },
  { label: 'DateTime', value: 'datetime', category: 'date' },
];

/**
 * Get field type category
 */
export const getFieldTypeCategory = (fieldType: string): string => {
  const option = FIELD_TYPE_OPTIONS.find(opt => opt.value === fieldType);
  return option?.category || 'other';
};

/**
 * Build validation rules from field metadata
 */
const buildValidationRules = (metadata: FieldMetadata): Rule[] => {
  const { label, is_required, validation_rules, field_type } = metadata;
  const rules: Rule[] = [];

  // Required validation
  if (is_required) {
    rules.push({
      required: true,
      message: `Please enter ${label.toLowerCase()}`,
    });
  }

  // Email validation
  if (field_type === 'email' || validation_rules?.email) {
    rules.push({
      type: 'email',
      message: 'Please enter a valid email address',
    });
  }

  // URL validation
  if (field_type === 'url') {
    rules.push({
      type: 'url',
      message: 'Please enter a valid URL',
    });
  }

  // Min/Max validation for numbers
  if (validation_rules?.min !== undefined) {
    rules.push({
      type: 'number',
      min: validation_rules.min,
      message: `Minimum value is ${validation_rules.min}`,
    });
  }

  if (validation_rules?.max !== undefined) {
    rules.push({
      type: 'number',
      max: validation_rules.max,
      message: `Maximum value is ${validation_rules.max}`,
    });
  }

  // Pattern validation
  if (validation_rules?.pattern) {
    rules.push({
      pattern: new RegExp(validation_rules.pattern),
      message: validation_rules.patternMessage || 'Invalid format',
    });
  }

  return rules;
};

/**
 * Generate form component based on field type
 */
const generateComponent = (
  metadata: FieldMetadata
): { component: React.ReactNode; valuePropName?: string } => {
  const { field_type, label, placeholder, validation_rules } = metadata;
  const placeholderText = placeholder || `Enter ${label.toLowerCase()}`;

  // Parse options if available
  const options: string[] = Array.isArray(validation_rules?.options)
    ? validation_rules.options
    : [];

  let component: React.ReactNode;
  let valuePropName: string | undefined;

  switch (field_type.toLowerCase()) {
    // Text inputs
    case 'text':
    case 'string':
      component = <Input placeholder={placeholderText} />;
      break;

    case 'textarea':
      component = <TextArea rows={4} placeholder={placeholderText} />;
      break;

    case 'email':
      component = <Input type="email" placeholder={placeholderText} />;
      break;

    case 'phone':
    case 'tel':
      component = <Input type="tel" placeholder={placeholderText} />;
      break;

    case 'url':
      component = <Input type="url" placeholder={placeholderText} />;
      break;

    case 'password':
      component = <Input.Password placeholder={placeholderText} />;
      break;

    // Numbers
    case 'number':
    case 'integer':
      component = (
        <InputNumber
          placeholder={placeholderText}
          style={{ width: '100%' }}
          min={validation_rules?.min}
          max={validation_rules?.max}
        />
      );
      break;

    case 'decimal':
    case 'float':
      component = (
        <InputNumber
          placeholder={placeholderText}
          style={{ width: '100%' }}
          min={validation_rules?.min}
          max={validation_rules?.max}
          step={0.01}
          precision={2}
        />
      );
      break;

    // Boolean/Choice
    case 'boolean':
    case 'switch':
      component = (
        <Switch checkedChildren="Yes" unCheckedChildren="No" defaultChecked={false} />
      );
      valuePropName = 'checked';
      break;

    case 'checkbox':
      component = <Checkbox>{label}</Checkbox>;
      valuePropName = 'checked';
      break;

    case 'select':
    case 'dropdown':
      component = (
        <Select
          placeholder={placeholderText}
          allowClear
          showSearch
          optionFilterProp="children"
          options={options.map(opt => ({ label: opt, value: opt }))}
        />
      );
      break;

    case 'multiselect':
      component = (
        <Select
          mode="multiple"
          placeholder={placeholderText}
          allowClear
          showSearch
          optionFilterProp="children"
          options={options.map(opt => ({ label: opt, value: opt }))}
        />
      );
      break;

    case 'radio':
      component = (
        <Radio.Group>
          {options.map((option) => (
            <Radio key={option} value={option}>
              {option}
            </Radio>
          ))}
        </Radio.Group>
      );
      break;

    // Date/Time
    case 'date':
      component = (
        <DatePicker
          style={{ width: '100%' }}
          format="YYYY-MM-DD"
          placeholder={placeholderText}
        />
      );
      break;

    case 'datetime':
      component = (
        <DatePicker
          showTime
          style={{ width: '100%' }}
          format="YYYY-MM-DD HH:mm:ss"
          placeholder={placeholderText}
        />
      );
      break;

    // Default fallback
    default:
      component = <Input placeholder={placeholderText} />;
  }

  return { component, valuePropName };
};

/**
 * Generate an Ant Design form item configuration from field metadata
 * @param metadata Field metadata configuration
 * @returns CrudFormItem for use in forms
 */
export const generateFormItemFromMetadata = (
  metadata: FieldMetadata
): CrudFormItem => {
  const { field_name, label } = metadata;

  // Build validation rules
  const rules = buildValidationRules(metadata);

  // Generate component
  const { component, valuePropName } = generateComponent(metadata);

  // Build form item
  const formItem: CrudFormItem = {
    label,
    name: field_name,
    rules,
    component,
  };

  // Add valuePropName if needed (for checkbox, switch, etc.)
  if (valuePropName) {
    formItem.valuePropName = valuePropName;
  }

  return formItem;
};

/**
 * Validate field metadata before saving
 * @param metadata Partial field metadata to validate
 * @returns Array of error messages (empty if valid)
 */
export const validateFieldMetadata = (metadata: Partial<FieldMetadata>): string[] => {
  const errors: string[] = [];

  // Required fields
  if (!metadata.entity_name?.trim()) {
    errors.push('Entity name is required');
  }

  if (!metadata.field_name?.trim()) {
    errors.push('Field name is required');
  } else {
    // Field name format validation
    if (!/^[a-z_][a-z0-9_]*$/i.test(metadata.field_name)) {
      errors.push(
        'Field name must start with a letter and contain only letters, numbers, and underscores'
      );
    }
  }

  if (!metadata.field_type?.trim()) {
    errors.push('Field type is required');
  }

  if (!metadata.label?.trim()) {
    errors.push('Label is required');
  }

  // Validate options for select/radio/multiselect fields
  const needsOptions = ['select', 'multiselect', 'radio'].includes(
    metadata.field_type || ''
  );
  
  if (needsOptions) {
    const options = metadata.validation_rules?.options;
    if (!options || !Array.isArray(options) || options.length === 0) {
      errors.push(`${metadata.field_type} fields must have at least one option`);
    }
  }

  // Validate min/max for number fields
  const isNumberField = ['number', 'integer', 'decimal', 'float'].includes(
    metadata.field_type || ''
  );
  
  if (isNumberField && metadata.validation_rules) {
    const { min, max } = metadata.validation_rules;
    if (min !== undefined && max !== undefined && min > max) {
      errors.push('Minimum value cannot be greater than maximum value');
    }
  }

  return errors;
};

/**
 * Check if a field type requires options
 */
export const fieldTypeNeedsOptions = (fieldType: string): boolean => {
  return ['select', 'multiselect', 'radio'].includes(fieldType);
};

/**
 * Check if a field type is numeric
 */
export const isNumericFieldType = (fieldType: string): boolean => {
  return ['number', 'integer', 'decimal', 'float'].includes(fieldType);
};

/**
 * Get default placeholder for a field type
 */
export const getDefaultPlaceholder = (fieldType: string, label: string): string => {
  const lowerLabel = label.toLowerCase();
  
  switch (fieldType) {
    case 'select':
    case 'dropdown':
      return `Select ${lowerLabel}`;
    case 'multiselect':
      return `Select multiple ${lowerLabel}`;
    case 'date':
    case 'datetime':
      return `Select ${lowerLabel}`;
    case 'email':
      return 'Enter email address';
    case 'phone':
    case 'tel':
      return 'Enter phone number';
    case 'url':
      return 'Enter URL';
    case 'password':
      return 'Enter password';
    default:
      return `Enter ${lowerLabel}`;
  }
};
