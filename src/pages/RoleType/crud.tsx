import React, { useMemo } from 'react';
import { Input, Switch, Tag } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getCurrentUserRole } from '../../helpers/auth';

interface RoleType extends Record<string, any> {
  _id: string;
  name: string;
  description?: string;
  is_global?: boolean;
}

const RoleTypeCrud: React.FC = () => {
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

  const roleTypeConfig = useMemo(() => ({
    title: 'Role Types',
    columns: [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => <strong>{text}</strong>,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
      },
      {
        title: 'Global',
        dataIndex: 'is_global',
        key: 'is_global',
        render: (isGlobal: boolean) =>
          isGlobal ? (
            <Tag
              icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
              color="success"
            >
              Yes
            </Tag>
          ) : (
            <Tag color="default">No</Tag>
          ),
      },
    ],
    formItems: [
      {
        label: 'Name',
        name: 'name',
        rules: [{ required: true, message: 'Please enter role type name!' }],
        component: <Input placeholder="Enter role type name" />,
      },
      {
        label: 'Description',
        name: 'description',
        rules: [],
        component: (
          <Input.TextArea
            rows={4}
            placeholder="Enter description (optional)"
          />
        ),
      },
      ...(isSuperAdmin
        ? [
            {
              label: 'Global',
              name: 'is_global',
              valuePropName: 'checked',
              component: (
                <Switch
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                  defaultChecked={false}
                />
              ),
            },
          ]
        : []),
    ],
    entityName: 'RoleType',
    formColumns: 2,
    searchFields: ['name'],
    canEdit: (record: RoleType) => {
      // If is_global is true, only superadmin can edit
      if (record.is_global) {
        return isSuperAdmin;
      }
      // Otherwise, all users can edit
      return true;
    },
    canDelete: (record: RoleType) => {
      // If is_global is true, only superadmin can delete
      if (record.is_global) {
        return isSuperAdmin;
      }
      // Otherwise, all users can delete
      return true;
    },
  }), [isSuperAdmin]);

  return (
    <GenericCrudPage
      config={roleTypeConfig}
      enableDynamicFields={true}
      entityName="roletype"
    />
  );
};

export default RoleTypeCrud;

