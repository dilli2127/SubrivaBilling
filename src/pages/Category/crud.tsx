import React, { useMemo } from 'react';
import { Input, InputNumber, Switch, Tag } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { Category } from '../../types/entities';
import { getCurrentUserRole } from '../../helpers/auth';
import BusinessTypeSelect from '../../components/common/BusinessTypeSelect';

const CategoryCrud: React.FC = () => {
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

  const categoryConfig = useMemo(
    () => ({
      title: 'Categories',
      columns: [
        { title: 'Name', dataIndex: 'category_name', key: 'category_name' },
        { title: 'Short Name', dataIndex: 'short_name', key: 'short_name' },
        {
          title: 'Tax Percentage',
          dataIndex: 'tax_percentage',
          key: 'tax_percentage',
        },
        ...(isSuperAdmin
          ? [
              {
                title: 'Business Type',
                dataIndex: 'business_type',
                key: 'business_type',
                render: (businessType: string) => (
                  <Tag color="blue">{businessType || '-'}</Tag>
                ),
              },
              {
                title: 'Global Category',
                dataIndex: 'global_category',
                key: 'global_category',
                render: (globalCategory: boolean) =>
                  globalCategory ? (
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
          : [
              {
                title: 'Global Category',
                dataIndex: 'global_category',
                key: 'global_category',
                render: (globalCategory: boolean) =>
                  globalCategory ? (
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
            ]),
      ],
      formItems: [
        {
          label: 'Category Name',
          name: 'category_name',
          rules: [{ required: true, message: 'Please enter category name' }],
          component: <Input placeholder="Enter category name" />,
        },
        {
          label: 'Short Name',
          name: 'short_name',
          rules: [{ required: false }],
          component: <Input placeholder="Enter short name (optional)" />,
        },
        {
          label: 'Tax Percentage',
          name: 'tax_percentage',
          rules: [{ required: true, message: 'Please enter tax percentage' }],
          component: (
            <InputNumber
              placeholder="Tax %"
              min={0}
              max={100}
              style={{ width: '100%' }}
            />
          ),
        },
        ...(isSuperAdmin
          ? [
              {
                label: 'Business Type',
                name: 'business_type',
                rules: [
                  { required: false, message: 'Please select business type!' },
                ],
                component: (
                  <BusinessTypeSelect placeholder="Select business type" allowClear />
                ),
              },
              {
                label: 'Global Category',
                name: 'global_category',
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
      entityName: 'Category',
      formColumns: 2,
      searchFields: ['category_name'],
      canEdit: (record: Category) => {
        // If global_category is true, only superadmin can edit
        if (record.global_category) {
          return isSuperAdmin;
        }
        // Otherwise, all users can edit
        return true;
      },
      canDelete: (record: Category) => {
        // If global_category is true, only superadmin can delete
        if (record.global_category) {
          return isSuperAdmin;
        }
        // Otherwise, all users can delete
        return true;
      },
    }),
    [isSuperAdmin]
  );

  return (
    <GenericCrudPage
      config={categoryConfig}
      enableDynamicFields={true}
      entityName="category"
    />
  );
};

export default CategoryCrud;
