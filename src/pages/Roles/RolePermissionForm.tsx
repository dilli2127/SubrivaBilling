import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Checkbox,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Tag,
} from 'antd';
import { AVAILABLE_RESOURCES, getGroupedResources } from '../../helpers/resourceConstants';

const { Title, Text } = Typography;
const { TextArea } = Input;

export interface PermissionState {
  [resource: string]: {
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
  };
}

interface RolePermissionFormProps {
  form: any;
  initialPermissions?: PermissionState;
  onPermissionsChange?: (permissions: PermissionState) => void;
}

/**
 * Role Permission Form Component
 * 
 * This component provides a form for creating/editing roles with the new permission system.
 * It uses CRUD checkboxes for each resource instead of menu checkboxes.
 */
const RolePermissionForm: React.FC<RolePermissionFormProps> = ({
  form,
  initialPermissions = {},
  onPermissionsChange
}) => {
  const [permissions, setPermissions] = useState<PermissionState>(initialPermissions);
  const groupedResources = getGroupedResources();

  useEffect(() => {
    if (Object.keys(initialPermissions).length > 0) {
      setPermissions(initialPermissions);
    }
  }, [initialPermissions]);

  useEffect(() => {
    if (onPermissionsChange) {
      onPermissionsChange(permissions);
    }
  }, [permissions, onPermissionsChange]);

  const handleCheckboxChange = (
    resource: string,
    action: 'can_create' | 'can_read' | 'can_update' | 'can_delete',
    checked: boolean
  ) => {
    setPermissions(prev => ({
      ...prev,
      [resource]: {
        ...(prev[resource] || {
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false
        }),
        [action]: checked
      }
    }));
  };

  const handleSelectAllForAction = (
    action: 'can_create' | 'can_read' | 'can_update' | 'can_delete',
    checked: boolean
  ) => {
    const updated = { ...permissions };
    AVAILABLE_RESOURCES.forEach(res => {
      if (!updated[res.resource]) {
        updated[res.resource] = {
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false
        };
      }
      updated[res.resource][action] = checked;
    });
    setPermissions(updated);
  };

  const handleSelectAllForResource = (resource: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [resource]: {
        can_create: checked,
        can_read: checked,
        can_update: checked,
        can_delete: checked
      }
    }));
  };

  // Get permissions array for submission
  const getPermissionsArray = () => {
    return Object.entries(permissions)
      .filter(([_, perms]) => 
        perms.can_create || perms.can_read || perms.can_update || perms.can_delete
      )
      .map(([resource, perms]) => ({
        resource,
        can_create: perms.can_create || false,
        can_read: perms.can_read || false,
        can_update: perms.can_update || false,
        can_delete: perms.can_delete || false
      }));
  };

  // Expose getPermissionsArray to parent via form
  useEffect(() => {
    if (form) {
      (form as any).getPermissionsArray = getPermissionsArray;
    }
  }, [permissions, form]);

  return (
    <div style={{ width: '100%' }}>
      <Form.Item
        label="Role Name"
        name="name"
        rules={[{ required: true, message: 'Please enter role name!' }]}
      >
        <Input placeholder="Enter role name" />
      </Form.Item>

      <Form.Item
        label="Role Type"
        name="roles_type"
        rules={[{ required: true, message: 'Please select role type!' }]}
      >
        <Select placeholder="Select role type" allowClear>
          <Select.Option value="Admin">Admin</Select.Option>
          <Select.Option value="Manager">Manager</Select.Option>
          <Select.Option value="Employee">Employee</Select.Option>
          <Select.Option value="Salesman">Salesman</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Description" name="description">
        <TextArea rows={3} placeholder="Enter role description (optional)" />
      </Form.Item>

      <Divider orientation="left">
        <Space>
          <Title level={5} style={{ margin: 0 }}>Permissions (CRUD)</Title>
          <Tag color="blue">Select permissions for each resource</Tag>
        </Space>
      </Divider>

      {/* Select All Row */}
      <Card size="small" style={{ marginBottom: 16, background: '#f0f2f5' }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Text strong>Select All:</Text>
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <Checkbox
              onChange={(e) => handleSelectAllForAction('can_create', e.target.checked)}
            >
              <Text strong>Create</Text>
            </Checkbox>
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <Checkbox
              onChange={(e) => handleSelectAllForAction('can_read', e.target.checked)}
            >
              <Text strong>Read</Text>
            </Checkbox>
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <Checkbox
              onChange={(e) => handleSelectAllForAction('can_update', e.target.checked)}
            >
              <Text strong>Update</Text>
            </Checkbox>
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <Checkbox
              onChange={(e) => handleSelectAllForAction('can_delete', e.target.checked)}
            >
              <Text strong>Delete</Text>
            </Checkbox>
          </Col>
        </Row>
      </Card>

      {/* Resource Permissions by Category */}
      <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: 8 }}>
        {Object.entries(groupedResources).map(([category, resources]) => (
          <Card
            key={category}
            title={<Text strong>{category}</Text>}
            size="small"
            style={{ marginBottom: 16 }}
          >
            {resources.map(res => {
              const perms = permissions[res.resource] || {
                can_create: false,
                can_read: false,
                can_update: false,
                can_delete: false
              };
              
              const allChecked = perms.can_create && perms.can_read && 
                                perms.can_update && perms.can_delete;
              
              return (
                <Row 
                  key={res.resource} 
                  gutter={16} 
                  align="middle"
                  style={{ 
                    marginBottom: 12, 
                    padding: 8,
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <Col span={8}>
                    <Space direction="vertical" size={0}>
                      <Space>
                        <Text strong>{res.label}</Text>
                        <Checkbox
                          checked={allChecked}
                          onChange={(e) => handleSelectAllForResource(res.resource, e.target.checked)}
                          style={{ fontSize: 11 }}
                        >
                          <Text type="secondary" style={{ fontSize: 11 }}>All</Text>
                        </Checkbox>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {res.description}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={4} style={{ textAlign: 'center' }}>
                    <Checkbox
                      checked={perms.can_create}
                      onChange={(e) => 
                        handleCheckboxChange(res.resource, 'can_create', e.target.checked)
                      }
                    />
                  </Col>
                  <Col span={4} style={{ textAlign: 'center' }}>
                    <Checkbox
                      checked={perms.can_read}
                      onChange={(e) => 
                        handleCheckboxChange(res.resource, 'can_read', e.target.checked)
                      }
                    />
                  </Col>
                  <Col span={4} style={{ textAlign: 'center' }}>
                    <Checkbox
                      checked={perms.can_update}
                      onChange={(e) => 
                        handleCheckboxChange(res.resource, 'can_update', e.target.checked)
                      }
                    />
                  </Col>
                  <Col span={4} style={{ textAlign: 'center' }}>
                    <Checkbox
                      checked={perms.can_delete}
                      onChange={(e) => 
                        handleCheckboxChange(res.resource, 'can_delete', e.target.checked)
                      }
                    />
                  </Col>
                </Row>
              );
            })}
          </Card>
        ))}
      </div>

      {/* Hidden field to store permissions - not actually used but satisfies form validation */}
      <Form.Item name="permissions" hidden>
        <Input type="hidden" />
      </Form.Item>
    </div>
  );
};

export default RolePermissionForm;

