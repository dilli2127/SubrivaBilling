import React from 'react';


export const rolesColumns = [
  {
    title: 'Role Name',
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
];
