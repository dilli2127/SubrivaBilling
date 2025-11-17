import React from 'react';
import { Input, Select, InputNumber } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { Rack } from '../../types/entities';

const { TextArea } = Input;

const rackConfig = {
  title: 'Racks',
  columns: [
    { title: 'Rack Name', dataIndex: 'name', key: 'name' },
    { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes' },
  ],
  formItems: [
    {
      label: 'Rack Name',
      name: 'name',
      rules: [{ required: true, message: 'Please enter the rack name!' }],
      component: <Input placeholder="e.g. Rack A1, Storage Rack 1" />,
    },
    {
      label: 'Capacity',
      name: 'capacity',
      component: <InputNumber placeholder="Enter capacity" min={1} style={{ width: '100%' }} />,
    },
    {
      label: 'Notes',
      name: 'notes',
      component: <TextArea placeholder="Enter notes" rows={3} />,
    },
  ],
  entityName: 'Rack',
  formColumns: 2,
  searchFields: ['name'],
};

const RackCrud: React.FC = () => {
  return (
    <GenericCrudPage 
      config={rackConfig}
      enableDynamicFields={true}
      entityName="rack"
    />
  );
};

export default RackCrud; 