import { Tag } from 'antd';

export const usersAccountColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => <strong>{text}</strong>,
  },
  {
    title: 'Username',
    dataIndex: 'user_name',
    key: 'user_name',
    render: (text: string) => <span style={{ color: '#1890ff' }}>{text}</span>,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Mobile',
    dataIndex: 'mobile',
    key: 'mobile',
  },
  {
    title: 'Role',
    dataIndex: 'roleItems',
    key: 'role_id',
    render: (roleItems: { name: string }) => (
      <Tag color="geekblue">{roleItems?.name}</Tag>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: boolean) => (
      <Tag color={status ? 'green' : 'volcano'}>
        {status ? 'Active' : 'Inactive'}
      </Tag>
    ),
  },
];
