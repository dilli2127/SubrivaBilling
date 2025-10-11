import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Form, Button, Space, Alert } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { FieldMetadata } from '../../hooks/useFieldMetadata';
import FieldForm from './FieldForm';
import FieldsTable from './FieldsTable';
import { useFieldMetadataOperations } from './hooks/useFieldMetadataOperations';
import { FieldMetadataManagerProps } from './types';

const FieldMetadataManager: React.FC<FieldMetadataManagerProps> = ({
  entityName,
  businessType = '',
  tenantId,
  organisationId,
  onFieldsUpdated,
}) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<FieldMetadata | null>(null);
  const [optionsText, setOptionsText] = useState('');

  // Use custom hook for operations
  const {
    fieldsData,
    fieldsLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    fetchFields,
    handleSubmitField,
    handleDeleteField,
  } = useFieldMetadataOperations({
    entityName,
    businessType,
    tenantId,
    organisationId,
    onFieldsUpdated,
  });

  // Fetch on modal open
  useEffect(() => {
    if (modalVisible) {
      fetchFields();
    }
  }, [modalVisible, fetchFields]);

  const handleOpenFieldModal = useCallback(
    (field?: FieldMetadata) => {
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
          display_order: (fieldsData.length || 0) + 1,
        });
      }
      setFieldModalVisible(true);
    },
    [form, entityName, businessType, fieldsData.length]
  );

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      await handleSubmitField(values, optionsText, editingField);
      
      // Close modal and reset form on success
      setFieldModalVisible(false);
      setEditingField(null);
      form.resetFields();
      setOptionsText('');
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  }, [form, optionsText, editingField, handleSubmitField]);

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

          <FieldsTable
            data={fieldsData}
            loading={fieldsLoading}
            deleteLoading={deleteLoading}
            onEdit={handleOpenFieldModal}
            onDelete={handleDeleteField}
          />
        </Space>
      </Modal>

      {/* Field Edit/Create Modal */}
      <Modal
        title={editingField ? 'Edit Field' : 'Add New Field'}
        open={fieldModalVisible}
        onOk={handleSubmit}
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

