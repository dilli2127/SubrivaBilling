import React, { memo } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { usersAccountColumns } from './columns';
import { usersAccountFormItems } from './formItems';

const usersConfig = {
  title: 'Users',
  columns: usersAccountColumns,
  formItems: usersAccountFormItems,
  apiRoutes: getEntityApiRoutes('Braches'),
  formColumns: 2,
  drawerWidth:800
};

const SalesAccountCrud: React.FC = () => {
  return <GenericCrudPage config={usersConfig} />;
};

export default  memo(SalesAccountCrud);
