import React from 'react';
import { Input, Select, Space, Tag } from 'antd';
import {
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  ShopOutlined,
  IdcardOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { PermissionAwareCrudPage } from '../../components/common/PermissionAwareCrudPage';
import { Customer } from '../../types/entities';
import { RESOURCES } from '../../helpers/permissionHelper';

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
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
      render: (companyName: string) => (
        <Space>
          <ShopOutlined style={{ color: '#722ed1' }} />
          <span>{companyName || '-'}</span>
        </Space>
      ),
    },
    {
      title: 'GST No',
      dataIndex: 'gst_no',
      key: 'gst_no',
      render: (gstNo: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#eb2f96' }} />
          <span>{gstNo || '-'}</span>
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
    {
      name: 'company_name',
      label: 'Company Name',
      rules: [{ required: false, message: 'Please enter company name' }],
      component: (
        <Input prefix={<ShopOutlined />} placeholder="Enter company name" />
      ),
    },
    {
      name: 'pan_no',
      label: 'PAN No',
      rules: [{ required: false, message: 'Please enter PAN number' }],
      component: (
        <Input
          prefix={<IdcardOutlined />}
          placeholder="Enter PAN number"
          maxLength={10}
        />
      ),
    },
    {
      name: 'gst_no',
      label: 'GST No',
      rules: [{ required: false, message: 'Please enter GST number' }],
      component: (
        <Input
          prefix={<FileTextOutlined />}
          placeholder="Enter GST number"
          maxLength={15}
        />
      ),
    },
    {
      name: 'city',
      label: 'City',
      rules: [{ required: false, message: 'Please enter city' }],
      component: (
        <Input prefix={<EnvironmentOutlined />} placeholder="Enter city" />
      ),
    },
    {
      name: 'state',
      label: 'State',
      rules: [{ required: false, message: 'Please enter state' }],
      component: (
        <Input prefix={<EnvironmentOutlined />} placeholder="Enter state" />
      ),
    },
    {
      name: 'pincode',
      label: 'Pincode',
      rules: [
        { required: false, message: 'Please enter pincode' },
        { len: 6, message: 'Pincode must be 6 digits' },
      ],
      component: (
        <Input
          prefix={<EnvironmentOutlined />}
          placeholder="Enter pincode"
          maxLength={6}
        />
      ),
    },
  ],
  entityName: 'Customer',
  formColumns: 2,
  drawerWidth: 600,
};

const CustomerCrud: React.FC = () => {
  return (
    <PermissionAwareCrudPage 
      resource={RESOURCES.CUSTOMER}
      config={customerConfig}
      enableDynamicFields={true}
      entityName="customer"
    />
  );
};

export default CustomerCrud;