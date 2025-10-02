import React from 'react';


export const rolesColumns = [
  {
    title: 'Role Name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => <strong>{text}</strong>,
  },
  {
    title: 'Role Type',
    dataIndex: 'roles_type',
    key: 'roles_type',
    render: (text: string) => (
      <span style={{ 
        padding: '4px 8px', 
        borderRadius: '4px', 
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: text === 'Admin' ? '#f6ffed' : '#fff7e6',
        color: text === 'Admin' ? '#52c41a' : '#fa8c16',
        border: `1px solid ${text === 'Admin' ? '#b7eb8f' : '#ffd591'}`
      }}>
        {text}
      </span>
    ),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
];
