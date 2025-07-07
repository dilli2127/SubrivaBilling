import React from 'react';
import { Input, InputNumber } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { Category } from '../../types/entities';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';

const categoryConfig = {
  title: 'Categories',
  columns: [
    { title: 'Name', dataIndex: 'category_name', key: 'category_name' },
    { title: 'HSN Code', dataIndex: 'hsn_code', key: 'hsn_code' },
    { title: 'Tax Percentage', dataIndex: 'tax_percentage', key: 'tax_percentage' },
  ],
  formItems: [
    {
      label: 'Category Name',
      name: 'category_name',
      rules: [{ required: true, message: 'Please enter category name' }],
      component: <Input placeholder="Enter category name" />,
    },
    {
      label: 'HSN Code',
      name: 'hsn_code',
      rules: [{ required: true, message: 'Please enter HSN code' }],
      component: <Input placeholder="Enter HSN code" />,
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
  ],
  apiRoutes: getEntityApiRoutes('Category'),
  formColumns: 2,
};

const CategoryCrud: React.FC = () => {
  return <GenericCrudPage config={categoryConfig} />;
};

export default CategoryCrud;
