import React from 'react';
import { Input, Switch } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';

const organisationsConfig = {
  title: 'Organizations',
  columns: [
    { title: 'Organization Name', dataIndex: 'org_name', key: 'org_name' },
    { title: 'Organization Code', dataIndex: 'org_code', key: 'org_code' },
    { title: 'Contact Person', dataIndex: 'contact_person', key: 'contact_person' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: boolean) => (
        <span style={{ color: status ? 'green' : 'red' }}>
          {status ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ],
  formItems: [
    {
      label: 'Organization Name',
      name: 'org_name',
      rules: [{ required: true, message: 'Please enter organization name!' }],
      component: <Input placeholder="Enter organization name" />,
    },
    {
      label: 'Organization Code',
      name: 'org_code',
      rules: [{ required: true, message: 'Please enter organization code!' }],
      component: <Input placeholder="Enter organization code" />,
    },
    {
      label: 'Contact Person',
      name: 'contact_person',
      rules: [{ required: true, message: 'Please enter contact person!' }],
      component: <Input placeholder="Enter contact person name" />,
    },
    {
      label: 'Phone',
      name: 'phone',
      rules: [{ required: true, message: 'Please enter phone number!' }],
      component: <Input placeholder="Enter phone number" />,
    },
    {
      label: 'Email',
      name: 'email',
      rules: [
        { required: true, message: 'Please enter email!' },
        { type: 'email', message: 'Please enter a valid email!' }
      ],
      component: <Input placeholder="Enter email address" />,
    },
    {
      label: 'Address',
      name: 'address',
      component: <Input.TextArea placeholder="Enter address" rows={3} />,
    },
    {
      label: 'Status',
      name: 'status',
      valuePropName: 'checked',
      component: (
        <Switch
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          defaultChecked
        />
      ),
    },
  ],
  apiRoutes: getEntityApiRoutes('Organisations'),
  formColumns: 2,
};

const OrganisationsCrud: React.FC = () => {
  return <GenericCrudPage config={organisationsConfig} />;
};

export default OrganisationsCrud; 