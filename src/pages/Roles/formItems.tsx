import React from 'react';
import { Input, Checkbox, Select } from 'antd';
import { menuItems } from '../../components/antd/sidebar/menu';

function flattenMenuItems(items: any[], parentLabel = ''): any[] {
  return items.reduce((acc: any[], item: any) => {
    if (item.children) {
      acc.push({ label: item.label, value: item.key, isParent: true });
      acc = acc.concat(flattenMenuItems(item.children, item.label + ' / '));
    } else {
      acc.push({ label: parentLabel + item.label, value: item.key });
    }
    return acc;
  }, []);
}

function getTenantManageKeys(items: any[]): string[] {
  const found = items.find((item: any) => item.key === 'tenant_manage');
  if (!found || !found.children) return [];
  return [found.key, ...found.children.map((child: any) => child.key)];
}
const tenantManageKeys = getTenantManageKeys(menuItems);

const menuOptions = flattenMenuItems(menuItems).filter(
  (opt: any) =>
    !opt.isParent &&
    !tenantManageKeys.includes(opt.value) &&
    opt.value !== 'organisation'
);

export const rolesFormItems = () => [
  {
    label: 'Role Name',
    name: 'name',
    rules: [{ required: true, message: 'Please enter role name!' }],
    component: <Input placeholder="Enter role name" />,
  },
  {
    label: 'Role Type',
    name: 'roles_type',
    rules: [{ required: true, message: 'Please select role type!' }],
    component: (
      <Select placeholder="Select role type" allowClear>
        <Select.Option value="Admin">Admin</Select.Option>
        <Select.Option value="Employee">Employee</Select.Option>
      </Select>
    ),
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
  {
    label: 'Permissions',
    name: 'allowedMenuKeys',
    rules: [
      { required: true, message: 'Please select at least one permission!' },
    ],
    component: <Checkbox.Group options={menuOptions} />,
  },
];
