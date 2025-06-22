import React from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { branchesFormItems } from './formItems';
import { organisationColumns } from './columns';

const organisationsConfig = {
  title: 'Branches',
  columns: organisationColumns,
  formItems: branchesFormItems,
  apiRoutes: getEntityApiRoutes('Braches'),
  formColumns: 2,
  // drawerWidth:800
};

const BrachesCrud: React.FC = () => {
  return <GenericCrudPage config={organisationsConfig} />;
};

export default BrachesCrud;
