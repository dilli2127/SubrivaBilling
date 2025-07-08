import React from 'react';
import { Input, Select, Space, Tag } from 'antd';
import {
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { Customer } from '../../types/entities';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';

const { Option } = Select;

const customerConfig = {
  title: 'Customer',
  columns: [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (name: string) => (
        <Tag icon={<UserOutlined />} color="geekblue">
          {name}
        </Tag>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined style={{ color: '#13c2c2' }} />
          <span>{email || '-'}</span>
        </Space>
      ),
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (mobile: string) => (
        <Space>
          <PhoneOutlined style={{ color: '#52c41a' }} />
          <span>{mobile || '-'}</span>
        </Space>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <Space>
          <HomeOutlined style={{ color: '#fa8c16' }} />
          <span>{address || '-'}</span>
        </Space>
      ),
    },
  ],
  formItems: [
    {
      name: 'full_name',
      label: 'Full Name',
      rules: [{ required: true, message: 'Please enter full name' }],
      component: (
        <Input prefix={<UserOutlined />} placeholder="Enter full name" />
      ),
    },
    {
      name: 'email',
      label: 'Email Address',
      rules: [
        { required: false, message: 'Please enter email' },
        { type: 'email', message: 'Please enter valid email' },
      ],
      component: <Input prefix={<MailOutlined />} placeholder="Enter email" />,
    },
    {
      name: 'mobile',
      label: 'Mobile Number',
      rules: [
        { required: true, message: 'Please enter mobile number' },
        { len: 10, message: 'Mobile number must be 10 digits' },
      ],
      component: (
        <Input
          prefix={<PhoneOutlined />}
          placeholder="Enter mobile number"
          maxLength={10}
        />
      ),
    },
    {
      name: 'address',
      label: 'Address',
      rules: [{ required: false, message: 'Please enter address' }],
      component: <Input.TextArea placeholder="Enter address" rows={3} />,
    },
    {
      name: 'customer_type',
      label: 'Customer Type',
      rules: [{ required: true, message: 'Please select customer type' }],
      component: (
        <Select placeholder="Select customer type">
          <Option value="regular">Regular</Option>
          <Option value="vip">VIP</Option>
          <Option value="wholesale">Wholesale</Option>
        </Select>
      ),
    },
  ],
  apiRoutes: getEntityApiRoutes('Customer'),
  formColumns: 2,
  drawerWidth: 600,
};

const CustomerCrud: React.FC = () => {
  return <GenericCrudPage config={customerConfig} />;
};

export default CustomerCrud;
