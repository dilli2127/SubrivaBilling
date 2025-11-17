import React, { memo, useEffect, useState } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { tenantAccountColumns } from './columns';
import { tenantAccountFormItems } from './formItems';

const TenantAccount: React.FC = () => {
  return (
    <GenericCrudPage
      config={{
        title: 'Tenant Accounts',
        columns: tenantAccountColumns,
        formItems: tenantAccountFormItems,
        entityName: 'TenantAccounts',
        formColumns: 2,
        searchFields: ['email', 'mobile'],
      }}
      enableDynamicFields={true}
      entityName="tenantaccounts"
    />
  );
};

export default memo(TenantAccount);
