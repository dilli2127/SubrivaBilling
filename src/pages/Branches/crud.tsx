import React, { useMemo } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { branchesFormItems } from './formItems';
import { brancheColumns } from './columns';
import { getCurrentUserRole } from '../../helpers/auth';
import { useSuperAdminFilters } from '../../hooks/useSuperAdminFilters';

const BranchesCrud: React.FC = () => {
  // Use centralised super admin filters/options to respect tenant selection and lazy loading
  const { organisationOptions } = useSuperAdminFilters();
  const organisationItems = useMemo(
    () => organisationOptions.map(o => ({ _id: o.value, org_name: o.label, name: o.label })),
    [organisationOptions]
  );

  const customButtons = [
    {
      key: 'export',
      label: 'Export',
      type: 'primary' as const,
      onClick: () => {
        // Implement export logic here
        alert('Comming Soon!');
      },
    },
  ];
  const userRole = getCurrentUserRole();
  return (
    <GenericCrudPage
      config={{
        title: 'Branches',
        entityName: 'Branches',
        columns: brancheColumns,
        formItems: branchesFormItems(organisationItems as any, userRole || ''),
        formColumns: 2,
        searchFields: ['branch_name'],
      }}
      customButtons={customButtons}
      enableDynamicFields={true}
    />
  );
};

export default BranchesCrud;
