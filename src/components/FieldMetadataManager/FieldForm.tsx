import React, { useMemo } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Divider,
  Row,
  Col,
} from 'antd';
import { FIELD_TYPE_OPTIONS } from '../../helpers/fieldMetadataUtils';
import { FieldFormProps } from './types';

const { TextArea } = Input;

const FieldForm: React.FC<FieldFormProps> = React.memo(({
  form,
  editingField,
  optionsText,
  onOptionsChange,
}) => {
  const selectedFieldType = Form.useWatch('field_type', form);
  
  const needsOptions = useMemo(
    () => ['select', 'multiselect', 'radio'].includes(selectedFieldType),
    [selectedFieldType]
  );
  
  const needsNumberValidation = useMemo(
    () => ['number', 'integer', 'decimal'].includes(selectedFieldType),
    [selectedFieldType]
  );

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        is_required: false,
        is_active: true,
        is_global: false,
        display_order: 0,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Entity Name"
            name="entity_name"
            rules={[{ required: true, message: 'Please enter entity name' }]}
          >
            <Input disabled={!!editingField} placeholder="e.g., products, customers" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Field Name"
            name="field_name"
            rules={[
              { required: true, message: 'Please enter field name' },
              {
                pattern: /^[a-z_][a-z0-9_]*$/i,
                message: 'Must start with a letter, only letters, numbers, underscores',
              },
            ]}
            extra="Use lowercase with underscores (e.g., custom_field_1)"
          >
            <Input placeholder="e.g., custom_field_1" disabled={!!editingField} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Field Type"
            name="field_type"
            rules={[{ required: true, message: 'Please select field type' }]}
          >
            <Select placeholder="Select field type" options={FIELD_TYPE_OPTIONS} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Label"
            name="label"
            rules={[{ required: true, message: 'Please enter label' }]}
          >
            <Input placeholder="Field label shown to users" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Placeholder" name="placeholder">
        <Input placeholder="Placeholder text (optional)" />
      </Form.Item>

      {needsOptions && (
        <>
          <Divider>Options Configuration</Divider>
          <Form.Item
            label="Options (one per line)"
            extra="Enter each option on a new line"
            required
          >
            <TextArea
              rows={4}
              value={optionsText}
              onChange={(e) => onOptionsChange(e.target.value)}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
            />
          </Form.Item>
        </>
      )}

      {needsNumberValidation && (
        <>
          <Divider>Number Validation</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Min Value" name="min">
                <InputNumber placeholder="Min" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Max Value" name="max">
                <InputNumber placeholder="Max" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      <Divider>Display Settings</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Display Order"
            name="display_order"
            extra="Lower numbers appear first"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Business Type" name="business_type">
            <Input placeholder="Business type (optional)" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Required Field"
            name="is_required"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Active" name="is_active" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Global Field" name="is_global" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
});

FieldForm.displayName = 'FieldForm';

export default FieldForm;

