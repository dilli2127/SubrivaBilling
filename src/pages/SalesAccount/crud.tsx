import React, { memo } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { salesAccountFormItems } from './formItems';
import { salesAccountColumns } from './columns';

const salesAccountConfig = {
  title: 'Sales Account',
  columns: salesAccountColumns,
  formItems: salesAccountFormItems,
  apiRoutes: getEntityApiRoutes('Braches'),
  formColumns: 2,
  drawerWidth:800
};

const SalesAccountCrud: React.FC = () => {
  return <GenericCrudPage config={salesAccountConfig} />;
};

export default  memo(SalesAccountCrud);
