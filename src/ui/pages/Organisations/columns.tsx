
import { Tag, Typography, Space } from 'antd';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const organisationColumns = [
  {
    title: 'Organization',
    dataIndex: 'org_name',
    key: 'org_name',
    render: (text: string) => <Text strong>{text}</Text>,
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
