import React, { useMemo } from 'react';
import { Input, Switch, Tag, Tooltip } from 'antd';
import { CheckCircleTwoTone, AppstoreAddOutlined } from '@ant-design/icons';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getCurrentUserRole } from '../../helpers/auth';

const { TextArea } = Input;

const EntityDefinitionsCrud: React.FC = () => {
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

  const entityConfig = useMemo(
    () => ({
      title: 'Custom Entities',
      columns: [
        {
          title: 'Entity Name',
          dataIndex: 'entity_name',
          key: 'entity_name',
          render: (text: string) => (
            <Tag icon={<AppstoreAddOutlined />} color="cyan">
              {text}
            </Tag>
          ),
        },
        {
          title: 'Display Name',
          dataIndex: 'display_name',
          key: 'display_name',
        },
        {
          title: 'Plural Name',
          dataIndex: 'plural_name',
          key: 'plural_name',
        },
        {
          title: 'Description',
          dataIndex: 'description',
          key: 'description',
          render: (text: string) => (
            <Tooltip title={text}>
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 200,
                  display: 'inline-block',
                }}
              >
                {text || '-'}
              </span>
            </Tooltip>
          ),
        },
        {
          title: 'Active',
          dataIndex: 'is_active',
          key: 'is_active',
          render: (isActive: boolean) =>
            isActive ? (
              <Tag color="success">Active</Tag>
            ) : (
              <Tag color="default">Inactive</Tag>
            ),
        },
        ...(isSuperAdmin
          ? [
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
            ]
          : []),
      ],
      formItems: [
        {
          label: 'Entity Name',
          name: 'entity_name',
          rules: [
            { required: true, message: 'Please enter entity name' },
            {
              pattern: /^[a-z_]+$/,
              message: 'Only lowercase letters and underscores (e.g., leads, custom_deals)',
            },
          ],
          component: (
            <Input placeholder="e.g., leads, deals, tickets (lowercase with underscores)" />
          ),
        },
        {
          label: 'Display Name (Singular)',
          name: 'display_name',
          rules: [{ required: true, message: 'Please enter display name' }],
          component: <Input placeholder="e.g., Lead, Deal, Ticket" />,
        },
        {
          label: 'Plural Name',
          name: 'plural_name',
          rules: [{ required: true, message: 'Please enter plural name' }],
          component: <Input placeholder="e.g., Leads, Deals, Tickets" />,
        },
        {
          label: 'Description',
          name: 'description',
          component: (
            <TextArea
              rows={3}
              placeholder="Describe what this entity represents"
            />
          ),
        },
        {
          label: 'Icon',
          name: 'icon',
          component: (
            <Input placeholder="e.g., user-plus, briefcase, file (Ant Design icons)" />
          ),
        },
        {
          label: 'Active',
          name: 'is_active',
          valuePropName: 'checked',
          component: (
            <Switch
              checkedChildren="Yes"
              unCheckedChildren="No"
              defaultChecked={true}
            />
          ),
        },
        ...(isSuperAdmin
          ? [
              {
                label: 'Global Entity',
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
      entityName: 'EntityDefinition',
      formColumns: 2,
      drawerWidth: 600,
      searchFields: ['entity_name', 'display_name'],
    }),
    [isSuperAdmin]
  );

  return (
    <GenericCrudPage
      config={entityConfig}
      enableSuperAdminFilters={true}
    />
  );
};

export default EntityDefinitionsCrud;

