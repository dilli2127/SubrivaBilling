import React from 'react';
import { Input, Switch } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { Vendor } from '../../types/entities';
import PermissionAwareCrudPage from '../../components/common/PermissionAwareCrudPage';
import { RESOURCES } from '../../helpers/permissionHelper';

const vendorConfig = {
  title: 'Vendor',
  columns: [
    {
      title: 'Vendor Name',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
    },
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: 'Contact Person',
      dataIndex: 'contact_person',
      key: 'contact_person',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'GST No',
      dataIndex: 'gst_no',
      key: 'gst_no',
    },
    {
      title: 'PAN No',
      dataIndex: 'pan_no',
      key: 'pan_no',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) =>
        status ? (
          <span style={{ color: 'green' }}>Active</span>
        ) : (
          <span style={{ color: 'red' }}>Inactive</span>
        ),
    },
  ],
  formItems: [
    {
      label: 'Vendor Name',
      name: 'vendor_name',
      rules: [{ required: true, message: 'Please enter vendor name!' }],
      component: <Input placeholder="Enter vendor name" />,
    },
    {
      label: 'Company Name',
      name: 'company_name',
      rules: [{ required: true, message: 'Please enter company name!' }],
      component: <Input placeholder="Enter company name" />,
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
      label: 'GST No',
      name: 'gst_no',
      component: <Input placeholder="Enter GST number" />,
    },
    {
      label: 'PAN No',
      name: 'pan_no',
      component: <Input placeholder="Enter PAN number" />,
    },
    {
      label: 'Address',
      name: 'address',
      component: <Input.TextArea placeholder="Enter address" rows={3} />,
    },
    {
      label: 'City',
      name: 'city',
      component: <Input placeholder="Enter city" />,
    },
    {
      label: 'State',
      name: 'state',
      component: <Input placeholder="Enter state" />,
    },
    {
      label: 'Pincode',
      name: 'pincode',
      component: <Input placeholder="Enter pincode" maxLength={6} />,
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
  entityName: 'Vendor',
  formColumns: 2,
};

const VendorCrud: React.FC = () => {
  return (
    <PermissionAwareCrudPage 
      resource={RESOURCES.VENDOR}
      config={vendorConfig}
      enableDynamicFields={true}
      entityName="vendor"
    />
  );
};

export default VendorCrud;
