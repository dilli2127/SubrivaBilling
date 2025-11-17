import React, { memo } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { organisationFormItems } from './formItems';
import { organisationColumns } from './columns';

const organisationsConfig = {
  title: 'Organizations',
  columns: organisationColumns,
  formItems: organisationFormItems,
  entityName: 'Organisations',
  formColumns: 2,
  drawerWidth: 800,
  searchFields: ['org_name'],
};

const OrganisationsCrud: React.FC = () => {
  return (
    <GenericCrudPage 
      config={organisationsConfig}
      enableDynamicFields={true}
      entityName="organisations"
    />
  );
};

export default memo(OrganisationsCrud);
