import React, { useMemo } from 'react';
import { Input, InputNumber, Select, Switch, Tag } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { Category } from '../../types/entities';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { getCurrentUserRole } from '../../helpers/auth';

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
                  <Select placeholder="Select business type" allowClear>
                    <Select.Option value="Supermarket / Grocery Store">
                      Supermarket / Grocery Store
                    </Select.Option>
                    <Select.Option value="Medical / Pharmacy">
                      Medical / Pharmacy
                    </Select.Option>
                    <Select.Option value="Hardware Store">
                      Hardware Store
                    </Select.Option>
                    <Select.Option value="Hardware and Electronics Store">
                      Hardware and Electronics Store
                    </Select.Option>
                    <Select.Option value="Electronics Store">
                      Electronics Store
                    </Select.Option>
                    <Select.Option value="Stationery / Book Store">
                      Stationery / Book Store
                    </Select.Option>
                    <Select.Option value="Clothing / Textile Store">
                      Clothing / Textile Store
                    </Select.Option>
                    <Select.Option value="Footwear Store">
                      Footwear Store
                    </Select.Option>
                    <Select.Option value="Bakery / Sweet Shop">
                      Bakery / Sweet Shop
                    </Select.Option>
                    <Select.Option value="Fruits & Vegetables Shop">
                      Fruits & Vegetables Shop
                    </Select.Option>
                    <Select.Option value="Furniture Store">
                      Furniture Store
                    </Select.Option>
                    <Select.Option value="Automobile / Spare Parts">
                      Automobile / Spare Parts
                    </Select.Option>
                    <Select.Option value="Mobile Accessories Store">
                      Mobile Accessories Store
                    </Select.Option>
                    <Select.Option value="Cosmetics / Beauty Store">
                      Cosmetics / Beauty Store
                    </Select.Option>
                    <Select.Option value="Jewellery / Fancy Store">
                      Jewellery / Fancy Store
                    </Select.Option>
                    <Select.Option value="Pet Store">Pet Store</Select.Option>
                    <Select.Option value="General Store">
                      General Store
                    </Select.Option>
                    <Select.Option value="Wholesale Business">
                      Wholesale Business
                    </Select.Option>
                    <Select.Option value="Computer & Laptop Store">
                      Computer & Laptop Store
                    </Select.Option>
                    <Select.Option value="Mobile And Laptop Store">
                      Mobile And Laptop Store
                    </Select.Option>
                    <Select.Option value="Electrical Store">
                      Electrical Store
                    </Select.Option>
                    <Select.Option value="Restaurant / Café">
                      Restaurant / Café
                    </Select.Option>
                  </Select>
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
      apiRoutes: getEntityApiRoutes('Category'),
      formColumns: 2,
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
