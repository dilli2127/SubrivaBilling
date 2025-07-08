import React from 'react';
import { Input } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { Unit } from '../../types/entities';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';

const unitConfig = {
  title: 'Units',
  columns: [
    { title: 'Unit Name', dataIndex: 'unit_name', key: 'unit_name' },
    { title: 'Unit Code', dataIndex: 'unit_code', key: 'unit_code' },
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
  ],
  apiRoutes: getEntityApiRoutes('Unit'),
  formColumns: 2,
};

const UnitCrud: React.FC = () => {
  return <GenericCrudPage config={unitConfig} />;
};

export default UnitCrud;
