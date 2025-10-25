import React, { useState } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import VirtualizedTable from './VirtualizedTable';
import { useGenericCrudRTK } from '../../hooks/useGenericCrudRTK';
// Define EntityName type locally
type EntityName = string;

interface RTKTableExampleProps {
  entityName: EntityName;
  columns: any[];
  height?: number;
}

const RTKTableExample: React.FC<RTKTableExampleProps> = ({
  entityName,
  columns,
  height = 400,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();

  // Use RTK hooks
  const { useCreate, useUpdate } = useGenericCrudRTK(entityName);
  const { create, isLoading: isCreating } = useCreate();
  const { update, isLoading: isUpdating } = useUpdate();

  // Handle create/edit
  const handleSave = async (values: any) => {
    try {
      if (editingRecord) {
        // Update existing record
        const result = await update(editingRecord.id, values);
        if (result.error) {
          message.error('Failed to update record');
        } else {
          message.success('Record updated successfully');
          setIsModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }
      } else {
        // Create new record
        const result = await create(values);
        if (result.error) {
          message.error('Failed to create record');
        } else {
          message.success('Record created successfully');
          setIsModalVisible(false);
          form.resetFields();
        }
      }
    } catch (error) {
      message.error('An error occurred');
    }
  };

  // Handle edit
  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle delete (this is handled by VirtualizedTable)
  const handleDelete = (record: any) => {
    console.log('Record deleted:', record);
  };

  // Handle refresh (this is handled by VirtualizedTable)
  const handleRefresh = () => {
    console.log('Table refreshed');
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAddNew}>
          Add New {entityName}
        </Button>
      </div>

      <VirtualizedTable
        entityName={entityName}
        columns={columns}
        height={height}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
        showActions={true}
        enablePagination={true}
        pageSize={10}
      />

      <Modal
        title={editingRecord ? `Edit ${entityName}` : `Add New ${entityName}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={editingRecord}
        >
          {/* This would be dynamically generated based on entity fields */}
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating || isUpdating}
              style={{ marginRight: 8 }}
            >
              {editingRecord ? 'Update' : 'Create'}
            </Button>
            <Button onClick={() => {
              setIsModalVisible(false);
              setEditingRecord(null);
              form.resetFields();
            }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RTKTableExample;
