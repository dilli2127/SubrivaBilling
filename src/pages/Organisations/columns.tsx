import React from 'react';

export const organisationColumns = [
  { title: 'Organization Name', dataIndex: 'org_name', key: 'org_name' },
  { title: 'Organization Code', dataIndex: 'org_code', key: 'org_code' },
  {
    title: 'Contact Person',
    dataIndex: 'contact_person',
    key: 'contact_person',
  },
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
]; 