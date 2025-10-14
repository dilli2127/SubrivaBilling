import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Select,
  message,
  Spin,
  Checkbox,
  Space,
  Typography,
  Tooltip,
  Tag,
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import requestBackServer from '../../services/api';
import { RESOURCES } from '../../helpers/permissionHelper';
import './PermissionManagement.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface Role {
  _id: string;
  name: string;
  roles_type: string;
  description?: string;
}

interface Permission {
  resource: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  allowed_menu_keys?: string[];
}

interface PermissionsMap {
  [resource: string]: Permission;
}

const PermissionManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [permissions, setPermissions] = useState<PermissionsMap>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch all roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Fetch permissions when role is selected
  useEffect(() => {
    if (selectedRoleId) {
      fetchRolePermissions(selectedRoleId);
    }
  }, [selectedRoleId]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await requestBackServer({
        method: 'GET',
        endpoint: '/roles',
      });

      if (response.statusCode === 200) {
        const rolesData = response.result || [];
        setRoles(rolesData);
      } else {
        message.error(`Failed to fetch roles: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      message.error('Error fetching roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    setLoading(true);
    try {
      const response = await requestBackServer({
        method: 'GET',
        endpoint: `/permissions/role/${roleId}`,
      });

      if (response.statusCode === 200) {
        // Handle the API response format - permissions are in 'resources' array
        const resourcesArray = response.result?.resources || [];
        
        if (resourcesArray.length === 0) {
          message.warning('No permissions found for this role. Please seed permissions first.');
          setPermissions({});
          return;
        }
        
        // Convert array format to object format for the component
        const permsData: PermissionsMap = {};
        resourcesArray.forEach((item: any) => {
          permsData[item.resource] = {
            resource: item.resource,
            can_create: item.can_create,
            can_read: item.can_read,
            can_update: item.can_update,
            can_delete: item.can_delete,
            allowed_menu_keys: item.allowed_menu_keys || []
          };
        });
        
        setPermissions(permsData);
      } else {
        message.error(`Failed to fetch permissions: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      message.error('Error fetching permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (
    resource: string,
    action: 'can_create' | 'can_read' | 'can_update' | 'can_delete',
    value: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: value,
      },
    }));
  };

  const handleSelectAll = (
    action: 'can_create' | 'can_read' | 'can_update' | 'can_delete',
    value: boolean
  ) => {
    const updatedPermissions = { ...permissions };
    Object.keys(updatedPermissions).forEach((resource) => {
      updatedPermissions[resource] = {
        ...updatedPermissions[resource],
        [action]: value,
      };
    });
    setPermissions(updatedPermissions);
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      message.warning('Please select a role first');
      return;
    }

    setSaving(true);
    try {
      const permissionsArray = Object.entries(permissions).map(
        ([resource, perms]) => ({
          resource,
          can_create: perms.can_create || false,
          can_read: perms.can_read || false,
          can_update: perms.can_update || false,
          can_delete: perms.can_delete || false
        })
      );

      const response = await requestBackServer({
        method: 'POST',
        endpoint: '/permissions/bulk',
        data: {
          role_id: selectedRoleId,
          permissions: permissionsArray,
        },
      });

      if (response.statusCode === 200) {
        message.success('Permissions updated successfully');
        // Refresh permissions
        fetchRolePermissions(selectedRoleId);
      } else {
        message.error(response.message || 'Failed to update permissions');
      }
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      message.error(
        error?.response?.data?.exception || 'Error saving permissions'
      );
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      width: 250,
      fixed: 'left' as const,
      render: (resource: string) => (
        <Space>
          <Text strong>{formatResourceName(resource)}</Text>
          <Tag color="blue">{resource}</Tag>
        </Space>
      ),
    },
    {
      title: (
        <Space direction="vertical" size={0} align="center">
          <Text>Create</Text>
          <Checkbox
            onChange={(e) => handleSelectAll('can_create', e.target.checked)}
            disabled={!selectedRoleId}
          >
            <Text type="secondary" style={{ fontSize: 11 }}>
              All
            </Text>
          </Checkbox>
        </Space>
      ),
      dataIndex: 'can_create',
      key: 'can_create',
      align: 'center' as const,
      width: 100,
      render: (value: boolean, record: any) => (
        <Checkbox
          checked={value}
          onChange={(e) =>
            handlePermissionChange(
              record.resource,
              'can_create',
              e.target.checked
            )
          }
          disabled={!selectedRoleId}
        />
      ),
    },
    {
      title: (
        <Space direction="vertical" size={0} align="center">
          <Text>Read</Text>
          <Checkbox
            onChange={(e) => handleSelectAll('can_read', e.target.checked)}
            disabled={!selectedRoleId}
          >
            <Text type="secondary" style={{ fontSize: 11 }}>
              All
            </Text>
          </Checkbox>
        </Space>
      ),
      dataIndex: 'can_read',
      key: 'can_read',
      align: 'center' as const,
      width: 100,
      render: (value: boolean, record: any) => (
        <Checkbox
          checked={value}
          onChange={(e) =>
            handlePermissionChange(
              record.resource,
              'can_read',
              e.target.checked
            )
          }
          disabled={!selectedRoleId}
        />
      ),
    },
    {
      title: (
        <Space direction="vertical" size={0} align="center">
          <Text>Update</Text>
          <Checkbox
            onChange={(e) => handleSelectAll('can_update', e.target.checked)}
            disabled={!selectedRoleId}
          >
            <Text type="secondary" style={{ fontSize: 11 }}>
              All
            </Text>
          </Checkbox>
        </Space>
      ),
      dataIndex: 'can_update',
      key: 'can_update',
      align: 'center' as const,
      width: 100,
      render: (value: boolean, record: any) => (
        <Checkbox
          checked={value}
          onChange={(e) =>
            handlePermissionChange(
              record.resource,
              'can_update',
              e.target.checked
            )
          }
          disabled={!selectedRoleId}
        />
      ),
    },
    {
      title: (
        <Space direction="vertical" size={0} align="center">
          <Text>Delete</Text>
          <Checkbox
            onChange={(e) => handleSelectAll('can_delete', e.target.checked)}
            disabled={!selectedRoleId}
          >
            <Text type="secondary" style={{ fontSize: 11 }}>
              All
            </Text>
          </Checkbox>
        </Space>
      ),
      dataIndex: 'can_delete',
      key: 'can_delete',
      align: 'center' as const,
      width: 100,
      render: (value: boolean, record: any) => (
        <Checkbox
          checked={value}
          onChange={(e) =>
            handlePermissionChange(
              record.resource,
              'can_delete',
              e.target.checked
            )
          }
          disabled={!selectedRoleId}
        />
      ),
    },
    {
      title: 'Summary',
      key: 'summary',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => {
        const perms = permissions[record.resource];
        const count = [
          perms?.can_create,
          perms?.can_read,
          perms?.can_update,
          perms?.can_delete,
        ].filter(Boolean).length;

        return (
          <Space>
            {count === 4 ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Full Access
              </Tag>
            ) : count === 0 ? (
              <Tag color="error" icon={<CloseCircleOutlined />}>
                No Access
              </Tag>
            ) : (
              <Tag color="processing">{count}/4</Tag>
            )}
          </Space>
        );
      },
    },
  ];

  const formatResourceName = (resource: string): string => {
    return resource
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const dataSource = Object.entries(permissions).map(([resource, perms]) => ({
    key: resource,
    resource: resource,
    can_create: perms.can_create,
    can_read: perms.can_read,
    can_update: perms.can_update,
    can_delete: perms.can_delete,
  }));

  const selectedRole = roles.find((r) => r._id === selectedRoleId);

  return (
    <div className="permission-management">
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Permission Management
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Refresh">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchRoles();
                  if (selectedRoleId) {
                    fetchRolePermissions(selectedRoleId);
                  }
                }}
              >
                Refresh
              </Button>
            </Tooltip>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              disabled={!selectedRoleId}
            >
              Save Changes
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Role Selection */}
          <div>
            <Text strong style={{ marginRight: 8 }}>
              Select Role:
            </Text>
            <Select
              style={{ width: 300 }}
              placeholder="Choose a role to manage permissions"
              value={selectedRoleId || undefined}
              onChange={setSelectedRoleId}
              loading={loading}
            >
              {roles.map((role) => (
                <Option key={role._id} value={role._id}>
                  <Space>
                    <Text>{role.name}</Text>
                    <Tag color="blue">{role.roles_type}</Tag>
                  </Space>
                </Option>
              ))}
            </Select>
            {selectedRole && (
              <Text type="secondary" style={{ marginLeft: 12 }}>
                {selectedRole.description}
              </Text>
            )}
          </div>

          {/* Permissions Table */}
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              scroll={{ x: 800, y: 500 }}
              bordered
              size="small"
              locale={{
                emptyText: selectedRoleId
                  ? 'No permissions found for this role'
                  : 'Please select a role to view permissions',
              }}
            />
          </Spin>

          {/* Summary Stats */}
          {selectedRoleId && dataSource.length > 0 && (
            <Card size="small" style={{ background: '#f5f5f5' }}>
              <Space size="large">
                <Text>
                  <Text strong>Total Resources:</Text> {dataSource.length}
                </Text>
                <Text>
                  <Text strong>Full Access:</Text>{' '}
                  {
                    dataSource.filter(
                      (d) =>
                        d.can_create &&
                        d.can_read &&
                        d.can_update &&
                        d.can_delete
                    ).length
                  }
                </Text>
                <Text>
                  <Text strong>No Access:</Text>{' '}
                  {
                    dataSource.filter(
                      (d) =>
                        !d.can_create &&
                        !d.can_read &&
                        !d.can_update &&
                        !d.can_delete
                    ).length
                  }
                </Text>
                <Text>
                  <Text strong>Partial Access:</Text>{' '}
                  {
                    dataSource.filter(
                      (d) =>
                        [
                          d.can_create,
                          d.can_read,
                          d.can_update,
                          d.can_delete,
                        ].filter(Boolean).length > 0 &&
                        !(
                          d.can_create &&
                          d.can_read &&
                          d.can_update &&
                          d.can_delete
                        )
                    ).length
                  }
                </Text>
              </Space>
            </Card>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default PermissionManagement;

