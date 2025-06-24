import React from 'react';
import { DatePicker, Input, InputNumber, Select, Upload } from 'antd';

export const organisationFormItems = [
  {
    label: 'Organization Name',
    name: 'org_name',
    rules: [{ required: true, message: 'Please enter organization name!' }],
    component: <Input placeholder="Enter organization name" />,
  },
  {
    label: 'Business Type',
    name: 'business_type',
    rules: [{ required: true, message: 'Please enter business type!' }],
    component: <Input placeholder="Enter business type" />,
  },
  {
    label: 'License Type',
    name: 'license_type',
    rules: [{ required: true, message: 'Please select license type!' }],
    component: (
      <Select
        placeholder="Select license type"
        options={[
          { label: 'Basic', value: 'starter' },
          { label: 'Standard', value: 'standard' },
          { label: 'Premium', value: 'pro' },
        ]}
      />
    ),
  },
  {
    label: 'License Expiry',
    name: 'license_expiry',
    rules: [
      { required: true, message: 'Please select license expiry date!' },
    ],
    component: <DatePicker style={{ width: '100%' }} />,
  },
  {
    label: 'Email',
    name: 'email',
    rules: [
      { required: true, message: 'Please enter email!' },
      { type: 'email', message: 'Please enter a valid email!' },
    ],
    component: <Input placeholder="Enter email" />,
  },
  {
    label: 'Phone',
    name: 'phone',
    rules: [{ required: true, message: 'Please enter phone number!' }],
    component: <Input placeholder="Enter phone number" />,
  },
  {
    label: 'GST Number',
    name: 'gst_number',
    component: <Input placeholder="Enter GST number" />,
  },
  
  {
    label: 'PAN Number',
    name: 'pan_number',
    component: <Input placeholder="Enter PAN number" />,
  },
  {
    label: 'Address',
    name: 'address',
    component: <Input.TextArea placeholder="Enter address" rows={2} />,
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
    component: <Input placeholder="Enter pincode" />,
  },
  {
    label: 'Currency',
    name: 'currency',
    component: <Input placeholder="e.g., INR, USD" />,
  },
  {
    label: 'Timezone',
    name: 'timezone',
    component: <Input placeholder="e.g., Asia/Kolkata" />,
  },
  {
    label: 'Logo',
    name: 'logo_url',
    component: (
      <Upload listType="picture" maxCount={1}>
        <div>Click to Upload</div>
      </Upload>
    ),
  },
  {
    label: 'Max Branches Allowed',
    name: 'max_branches_allowed',
    rules: [
      { required: true, message: 'Please enter max branches allowed!' },
    ],
    component: <InputNumber min={1} style={{ width: '100%' }} />,
  },
  {
    label: 'Max Sales Users',
    name: 'max_sales_users',
    rules: [{ required: true, message: 'Please enter max sales users!' }],
    component: <InputNumber min={1} style={{ width: '100%' }} />,
  },
  {
    label: 'Owner Name',
    name: 'owner_name',
    component: <Input placeholder="Enter Owner Name" />,
  },
  {
    label: 'Owner Email',
    name: 'owner_email',
    component: <Input placeholder="Enter Owner Email" />,
  },
  {
    label: 'Owner Phone',
    name: 'owner_phone',
    component: <Input placeholder="Enter Owner Phone" />,
  },
  {
    label: 'Owner Designation',
    name: 'owner_designation',
    component: <Input placeholder="Enter Owner Designation" />,
  },
  {
    label: 'Status',
    name: 'status',
    component: (
      <Select
        placeholder="Select status"
        options={[
          { label: 'Active', value: true },
          { label: 'Inactive', value: false },
        ]}
      />
    ),
  },
]; 