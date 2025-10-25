import React from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { branchesFormItems } from './formItems';
import { brancheColumns } from './columns';
import { getCurrentUserRole } from '../../helpers/auth';
import { apiSlice } from '../../services/redux/api/apiSlice';

const BranchesCrud: React.FC = () => {
  // Use RTK Query for fetching organizations
  const { data: organisationData } = apiSlice.useGetOrganisationsQuery({});
  const organisationItems = (organisationData as any)?.result || [];

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
        formItems: branchesFormItems(organisationItems?.result, userRole || ''),
        formColumns: 2,
      }}
      customButtons={customButtons}
      enableDynamicFields={true}
    />
  );
};

export default BranchesCrud;
