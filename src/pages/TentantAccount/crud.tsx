import React, { memo, useEffect, useState } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { tenantAccountColumns } from './columns';
import { tenantAccountFormItems } from './formItems';

const TenantAccount: React.FC = () => {
  return (
    <GenericCrudPage
      config={{
        title: 'Tenant Accounts',
        columns: tenantAccountColumns,
        formItems: tenantAccountFormItems,
        apiRoutes: getEntityApiRoutes('Tenant'),
        formColumns: 2,
      }}
      enableDynamicFields={true}
      entityName="tenant"
    />
  );
};

export default memo(TenantAccount);
