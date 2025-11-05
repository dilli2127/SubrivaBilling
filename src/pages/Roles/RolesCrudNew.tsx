import React, { useState, useEffect, memo } from 'react';
import { Form, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import GlobalTable from '../../components/antd/GlobalTable';
import GlobalDrawer from '../../components/antd/GlobalDrawer';
import RolePermissionForm, { PermissionState } from './RolePermissionForm';
import { rolesColumns } from './columns';
import requestBackServer from '../../services/api';

interface Role {
  _id: string;
  name: string;
  description?: string;
  roles_type: string;
  allowedMenuKeys?: string[];
}

/**
 * Roles CRUD Page - Uses new Permission System
 * 
 * This page handles role creation and editing with the new permission-based approach.
 * It sends a `permissions` array instead of `allowedMenuKeys` to the backend.
 */
const RolesCrudNew: React.FC = () => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<PermissionState>({});
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchRoles();
  }, [pagination.current, pagination.pageSize]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await requestBackServer({
        method: 'GET',
        endpoint: '/roles',
        data: {
          pageNumber: pagination.current,
          pageLimit: pagination.pageSize,
        },
      });

      if (response.statusCode === 200) {
        setRoles(response.result || []);
        const paginationData = response.pagination as any;
        setPagination(prev => ({
          ...prev,
          total: paginationData?.totalCount || paginationData?.total || response.result?.length || 0,
        }));
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

  const handleAdd = () => {
    setEditingRole(null);
    setPermissions({});
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = async (record: Role) => {
    setEditingRole(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      roles_type: record.roles_type,
    });

    // Fetch permissions for this role
    try {
      const response = await requestBackServer({
        method: 'GET',
        endpoint: `/permissions/role/${record._id}`,
      });

      if (response.statusCode === 200) {
        const resourcesArray = response.result?.resources || [];
        
        // Convert to PermissionState format
        const permsData: PermissionState = {};
        resourcesArray.forEach((item: any) => {
          permsData[item.resource] = {
            can_create: item.can_create,
            can_read: item.can_read,
            can_update: item.can_update,
            can_delete: item.can_delete,
          };
        });
        
        setPermissions(permsData);
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      message.warning('Could not load permissions for this role');
    }

    setDrawerVisible(true);
  };

  const handleDelete = async (record: Role) => {
    Modal.confirm({
      title: 'Delete Role',
      content: `Are you sure you want to delete role "${record.name}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const response = await requestBackServer({
            method: 'DELETE',
            endpoint: `/roles/${record._id}`,
          });

          if (response.statusCode === 200) {
            message.success('Role deleted successfully');
            fetchRoles();
          } else {
            message.error(`Failed to delete role: ${response.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Error deleting role:', error);
          message.error('Error deleting role');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate form fields
      const values = await form.validateFields();
      
      // Build permissions array from state
      const permissionsArray = Object.entries(permissions)
        .filter(([_, perms]) => 
          perms.can_create || perms.can_read || perms.can_update || perms.can_delete
        )
        .map(([resource, perms]) => ({
          resource,
          can_create: perms.can_create || false,
          can_read: perms.can_read || false,
          can_update: perms.can_update || false,
          can_delete: perms.can_delete || false,
        }));

      // Validate at least one permission is selected
      if (permissionsArray.length === 0) {
        message.warning('Please select at least one permission');
        return;
      }

      // Prepare payload with NEW format (permissions array)
      const payload = {
        name: values.name,
        description: values.description,
        roles_type: values.roles_type,
        permissions: permissionsArray, // ✅ NEW: Send permissions array
      };

      setSubmitting(true);

      if (editingRole) {
        // Update existing role
        const response = await requestBackServer({
          method: 'PATCH',
          endpoint: `/roles/${editingRole._id}`,
          data: payload,
        });

        if (response.statusCode === 200) {
          message.success('Role updated successfully');
          setDrawerVisible(false);
          form.resetFields();
          setPermissions({});
          fetchRoles();
        } else {
          message.error(`Failed to update role: ${response.message || 'Unknown error'}`);
        }
      } else {
        // Create new role
        const response = await requestBackServer({
          method: 'PUT',
          endpoint: '/roles',
          data: payload,
        });

        if (response.statusCode === 201 || response.statusCode === 200) {
          message.success('Role created successfully');
          setDrawerVisible(false);
          form.resetFields();
          setPermissions({});
          fetchRoles();
        } else {
          message.error(`Failed to create role: ${response.message || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('Error submitting role:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error('Error submitting role');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setDrawerVisible(false);
    form.resetFields();
    setPermissions({});
    setEditingRole(null);
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize,
    }));
  };

  // Add actions column
  const columns: any = [
    ...rolesColumns,
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <EditOutlined
            style={{ cursor: 'pointer', color: '#1890ff', fontSize: '16px' }}
            onClick={() => handleEdit(record)}
          />
          <DeleteOutlined
            style={{ cursor: 'pointer', color: '#ff4d4f', fontSize: '16px' }}
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Roles</h1>
        <button
          onClick={handleAdd}
          style={{
            padding: '8px 16px',
            background: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <PlusOutlined /> Add Role
        </button>
      </div>

      <GlobalTable
        columns={columns}
        data={roles}
        loading={loading}
        totalCount={pagination.total}
        pageLimit={pagination.pageSize}
        onPaginationChange={handlePaginationChange}
        rowKeyField="_id"
      />

      <GlobalDrawer
        title={editingRole ? 'Edit Role' : 'Create Role'}
        open={drawerVisible}
        onClose={handleCancel}
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <RolePermissionForm
            form={form}
            initialPermissions={permissions}
            onPermissionsChange={setPermissions}
          />
          
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '8px 24px',
                background: '#fff',
                color: '#000',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 24px',
                background: submitting ? '#d9d9d9' : '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </Form>
      </GlobalDrawer>
    </div>
  );
};

export default memo(RolesCrudNew);

