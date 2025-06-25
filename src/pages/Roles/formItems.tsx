import React from 'react';
import { Input} from 'antd';

export const rolesFormItems = () => [
  {
    label: 'Role Name',
    name: 'name',
    rules: [{ required: true, message: 'Please enter role name!' }],
    component: <Input placeholder="Enter role name" />,
  },
  {
    label: 'Description',
    name: 'description',
    rules: [],
    component: (
      <Input.TextArea
        rows={4}
        placeholder="Enter role description (optional)"
      />
    ),
  },
];
