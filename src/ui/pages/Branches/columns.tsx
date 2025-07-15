
import { Tag, Typography, Space } from 'antd';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const brancheColumns = [
  {
    title: 'Branch',
    dataIndex: 'branch_name',
    key: 'branch_name',
    render: (text: string) => <Text strong>{text}</Text>,
  },
  {
    title: 'Organization',
    dataIndex: 'OrganisationItem',
    key: 'OrganisationItem',
    render: (org: { org_name: string }) => <Text strong>{org?.org_name}</Text>,
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
    render: (phone: string) => (
      <Space>
        <PhoneOutlined style={{ color: '#1890ff' }} />
        <Text>{phone}</Text>
      </Space>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: (email: string) => (
      <Space>
        <MailOutlined style={{ color: '#722ed1' }} />
        <Text type="secondary">{email}</Text>
      </Space>
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
