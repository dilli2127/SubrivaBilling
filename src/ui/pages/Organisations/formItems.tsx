import {
  Input,
  Switch,
  Upload,
} from 'antd';

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
];
