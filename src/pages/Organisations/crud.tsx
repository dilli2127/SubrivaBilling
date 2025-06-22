import React from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { organisationFormItems } from './formItems';
import { organisationColumns } from './columns';

const organisationsConfig = {
  title: 'Organizations',
  columns: organisationColumns,
  formItems: organisationFormItems,
  apiRoutes: getEntityApiRoutes('Organisations'),
  formColumns: 2,
};

const OrganisationsCrud: React.FC = () => {
  return <GenericCrudPage config={organisationsConfig} />;
};

export default OrganisationsCrud;
