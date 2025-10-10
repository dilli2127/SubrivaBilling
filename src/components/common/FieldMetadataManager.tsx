import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Button,
  Table,
  Space,
  Popconfirm,
  Tag,
  Alert,
  Divider,
  Row,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { dynamic_request, useDynamicSelector, dynamic_clear } from '../../services/redux';
import { FieldMetadata } from '../../hooks/useFieldMetadata';
import { FIELD_TYPE_OPTIONS, validateFieldMetadata } from '../../helpers/fieldMetadataUtils';
import { showToast } from '../../helpers/Common_functions';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';

const { TextArea } = Input;

interface FieldMetadataManagerProps {
  entityName: string;
  businessType?: string;
  tenantId?: string;
  organisationId?: string;
  onFieldsUpdated?: () => void;
}

// Extract Field Form component for better organization
const FieldForm: React.FC<{
  form: any;
  editingField: FieldMetadata | null;
  optionsText: string;
  onOptionsChange: (text: string) => void;
}> = React.memo(({ form, editingField, optionsText, onOptionsChange }) => {
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

const FieldMetadataManager: React.FC<FieldMetadataManagerProps> = ({
  entityName,
  businessType = '',
  tenantId,
  organisationId,
  onFieldsUpdated,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<FieldMetadata | null>(null);
  const [optionsText, setOptionsText] = useState('');

  // Get API routes using the generic helper (memoized)
  const apiRoutes = useMemo(() => getEntityApiRoutes('FieldMetadata'), []);

  // Redux selectors using the identifiers from API routes
  const { items: fieldsResponse, loading: fieldsLoading } = useDynamicSelector(
    apiRoutes.get.identifier
  );
  const { items: createResponse, loading: createLoading } = useDynamicSelector(
    apiRoutes.create.identifier
  );
  const { items: updateResponse, loading: updateLoading } = useDynamicSelector(
    apiRoutes.update.identifier
  );
  const { items: deleteResponse, loading: deleteLoading } = useDynamicSelector(
    apiRoutes.delete.identifier
  );

  // Fetch field metadata using generic API route
  const fetchFields = useCallback(() => {
    dispatch(
      dynamic_request(
        {
          method: apiRoutes.get.method,
          endpoint: apiRoutes.get.endpoint,
          data: {
            entity_name: entityName,
            is_active: undefined, // Get all fields (active and inactive)
          },
        },
        apiRoutes.get.identifier
      ) as any
    );
  }, [dispatch, entityName, apiRoutes.get]);

  // Fetch on modal open
  useEffect(() => {
    if (modalVisible) {
      fetchFields();
    }
  }, [modalVisible, fetchFields]);

  // Combined success handler for create/update/delete
  useEffect(() => {
    const handleSuccess = (
      response: any,
      action: 'created' | 'updated' | 'deleted',
      identifier: string
    ) => {
      if (response?.statusCode === 200) {
        showToast('success', `Field ${action} successfully`);
        fetchFields();
        
        if (action !== 'deleted') {
          setFieldModalVisible(false);
          setEditingField(null);
          form.resetFields();
        }
        
        if (onFieldsUpdated) onFieldsUpdated();
        dispatch(dynamic_clear(identifier) as any);
      }
    };

    handleSuccess(createResponse, 'created', apiRoutes.create.identifier);
    handleSuccess(updateResponse, 'updated', apiRoutes.update.identifier);
    handleSuccess(deleteResponse, 'deleted', apiRoutes.delete.identifier);
  }, [
    createResponse,
    updateResponse,
    deleteResponse,
    fetchFields,
    form,
    onFieldsUpdated,
    dispatch,
    apiRoutes.create.identifier,
    apiRoutes.update.identifier,
    apiRoutes.delete.identifier,
  ]);

  const handleOpenFieldModal = useCallback((field?: FieldMetadata) => {
    if (field) {
      setEditingField(field);
      const options = field.validation_rules?.options || [];
      setOptionsText(options.join('\n'));
      form.setFieldsValue({
        ...field,
        min: field.validation_rules?.min,
        max: field.validation_rules?.max,
      });
    } else {
      setEditingField(null);
      setOptionsText('');
      form.resetFields();
      form.setFieldsValue({
        entity_name: entityName,
        business_type: businessType,
        is_required: false,
        is_active: true,
        is_global: false,
        display_order: (fieldsResponse?.result?.length || 0) + 1,
      });
    }
    setFieldModalVisible(true);
  }, [form, entityName, businessType, fieldsResponse?.result?.length]);

  const handleSubmitField = useCallback(async () => {
    try {
      const values = await form.validateFields();
      
      // Build validation rules
      const validationRules: any = {};
      const fieldType = values.field_type;
      
      // Handle options for select/radio fields
      if (['select', 'multiselect', 'radio'].includes(fieldType)) {
        const options = optionsText
          .split('\n')
          .map(opt => opt.trim())
          .filter(opt => opt.length > 0);
        
        if (options.length === 0) {
          showToast('error', 'Please provide at least one option');
          return;
        }
        validationRules.options = options;
      }

      // Add number validation rules
      if (values.min !== undefined && values.min !== null) {
        validationRules.min = values.min;
      }
      if (values.max !== undefined && values.max !== null) {
        validationRules.max = values.max;
      }

      // Build payload
      const payload: any = {
        entity_name: values.entity_name,
        field_name: values.field_name,
        business_type: values.business_type || businessType,
        field_type: values.field_type,
        label: values.label,
        placeholder: values.placeholder,
        is_required: values.is_required || false,
        validation_rules: validationRules,
        display_order: values.display_order || 0,
        is_active: values.is_active !== false,
        is_global: values.is_global || false,
      };

      if (tenantId) payload.tenant_id = tenantId;
      if (organisationId) payload.organisation_id = organisationId;

      // Validate before submission
      const errors = validateFieldMetadata(payload);
      if (errors.length > 0) {
        showToast('error', errors[0]); // Show first error
        return;
      }

      // Submit
      const requestConfig = editingField
        ? {
            method: apiRoutes.update.method,
            endpoint: `${apiRoutes.update.endpoint}/${editingField._id}`,
            data: payload,
          }
        : {
            method: apiRoutes.create.method,
            endpoint: apiRoutes.create.endpoint,
            data: payload,
          };

      dispatch(
        dynamic_request(
          requestConfig,
          editingField ? apiRoutes.update.identifier : apiRoutes.create.identifier
        ) as any
      );
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  }, [
    form,
    optionsText,
    businessType,
    tenantId,
    organisationId,
    editingField,
    apiRoutes,
    dispatch,
  ]);

  const handleDeleteField = useCallback((fieldId: string) => {
    dispatch(
      dynamic_request(
        {
          method: apiRoutes.delete.method,
          endpoint: `${apiRoutes.delete.endpoint}/${fieldId}`,
          data: { _id: fieldId },
        },
        apiRoutes.delete.identifier
      ) as any
    );
  }, [dispatch, apiRoutes.delete]);

  // Memoized columns definition
  const columns: ColumnsType<FieldMetadata> = useMemo(
    () => [
      {
        title: 'Label',
        dataIndex: 'label',
        key: 'label',
        sorter: (a, b) => a.label.localeCompare(b.label),
      },
      {
        title: 'Field Name',
        dataIndex: 'field_name',
        key: 'field_name',
        render: (text: string) => <Tag color="blue">{text}</Tag>,
      },
      {
        title: 'Type',
        dataIndex: 'field_type',
        key: 'field_type',
        render: (text: string) => <Tag color="cyan">{text}</Tag>,
        filters: FIELD_TYPE_OPTIONS.map(opt => ({ text: opt.label, value: opt.value })),
        onFilter: (value, record) => record.field_type === value,
      },
      {
        title: 'Required',
        dataIndex: 'is_required',
        key: 'is_required',
        render: (value: boolean) => (
          <Tag color={value ? 'red' : 'default'}>{value ? 'Yes' : 'No'}</Tag>
        ),
        filters: [
          { text: 'Required', value: true },
          { text: 'Optional', value: false },
        ],
        onFilter: (value, record) => record.is_required === value,
      },
      {
        title: 'Active',
        dataIndex: 'is_active',
        key: 'is_active',
        render: (value: boolean) => (
          <Tag color={value ? 'green' : 'default'}>{value ? 'Yes' : 'No'}</Tag>
        ),
        filters: [
          { text: 'Active', value: true },
          { text: 'Inactive', value: false },
        ],
        onFilter: (value, record) => record.is_active === value,
      },
      {
        title: 'Order',
        dataIndex: 'display_order',
        key: 'display_order',
        sorter: (a, b) => a.display_order - b.display_order,
        width: 80,
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        fixed: 'right',
        render: (_: any, record: FieldMetadata) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenFieldModal(record)}
            />
            <Popconfirm
              title="Delete this field?"
              description="This action cannot be undone."
              onConfirm={() => handleDeleteField(record._id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoading}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleOpenFieldModal, handleDeleteField, deleteLoading]
  );

  // Memoized fields data
  const fieldsData = useMemo(
    () => fieldsResponse?.result || [],
    [fieldsResponse?.result]
  );

  const confirmLoading = createLoading || updateLoading;

  return (
    <>
      <Button
        icon={<SettingOutlined />}
        onClick={() => setModalVisible(true)}
        type="default"
      >
        Manage Fields
      </Button>

      {/* Fields List Modal */}
      <Modal
        title={`Manage Fields - ${entityName}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="Dynamic Fields"
            description="Add custom fields to this entity. These fields will be automatically added to the form."
            type="info"
            showIcon
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenFieldModal()}
            >
              Add New Field
            </Button>
          </div>

          <Table
            dataSource={fieldsData}
            columns={columns}
            loading={fieldsLoading}
            rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            size="middle"
            scroll={{ x: 900 }}
          />
        </Space>
      </Modal>

      {/* Field Edit/Create Modal */}
      <Modal
        title={editingField ? 'Edit Field' : 'Add New Field'}
        open={fieldModalVisible}
        onOk={handleSubmitField}
        onCancel={() => {
          setFieldModalVisible(false);
          setEditingField(null);
          form.resetFields();
          setOptionsText('');
        }}
        width={700}
        confirmLoading={confirmLoading}
        destroyOnClose
      >
        <FieldForm
          form={form}
          editingField={editingField}
          optionsText={optionsText}
          onOptionsChange={setOptionsText}
        />
      </Modal>
    </>
  );
};

export default React.memo(FieldMetadataManager);
