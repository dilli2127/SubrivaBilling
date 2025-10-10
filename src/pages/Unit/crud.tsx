import React, { useMemo } from 'react';
import { Input, Switch, Tag } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { Unit } from '../../types/entities';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { getCurrentUserRole } from '../../helpers/auth';

const UnitCrud: React.FC = () => {
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

  const unitConfig = useMemo(() => ({
    title: 'Units',
    columns: [
      { title: 'Unit Name', dataIndex: 'unit_name', key: 'unit_name' },
      { title: 'Unit Code', dataIndex: 'unit_code', key: 'unit_code' },
      ...(isSuperAdmin ? [{
        title: 'Global Unit',
        dataIndex: 'is_global',
        key: 'is_global',
        render: (isGlobal: boolean) => (
          isGlobal ? (
            <Tag
              icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
              color="success"
            >
              Yes
            </Tag>
          ) : (
            <Tag color="default">
              No
            </Tag>
          )
        ),
      }] : [
        {
          title: 'Global Unit',
          dataIndex: 'is_global',
          key: 'is_global',
          render: (isGlobal: boolean) => (
            isGlobal ? (
              <Tag
                icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
                color="success"
              >
                Yes
              </Tag>
            ) : (
              <Tag color="default">
                No
              </Tag>
            )
          ),
        }
      ]),
    ],
    formItems: [
      {
        label: 'Unit Name',
        name: 'unit_name',
        rules: [{ required: true, message: 'Please enter the unit name!' }],
        component: <Input placeholder="e.g. Piece, Kg, Box" />,
      },
      {
        label: 'Short Code',
        name: 'unit_code',
        rules: [{ required: true, message: 'Please enter unit short code!' }],
        component: <Input placeholder="e.g. pcs, kg, box" />,
      },
      ...(isSuperAdmin ? [{
        label: 'Global Unit',
        name: 'is_global',
        valuePropName: 'checked',
        component: (
          <Switch
            checkedChildren="Yes"
            unCheckedChildren="No"
            defaultChecked={false}
          />
        ),
      }] : []),
    ],
    apiRoutes: getEntityApiRoutes('Unit'),
    formColumns: 2,
    canEdit: (record: Unit) => {
      // If is_global is true, only superadmin can edit
      if (record.is_global) {
        return isSuperAdmin;
      }
      // Otherwise, all users can edit
      return true;
    },
    canDelete: (record: Unit) => {
      // If is_global is true, only superadmin can delete
      if (record.is_global) {
        return isSuperAdmin;
      }
      // Otherwise, all users can delete
      return true;
    },
  }), [isSuperAdmin]);

  return <GenericCrudPage config={unitConfig} />;
};

export default UnitCrud;
