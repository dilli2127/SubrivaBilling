import React, { useEffect, useState, useMemo } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { branchesFormItems } from './formItems';
import { brancheColumns } from './columns';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux/selector';
import { getCurrentUserRole } from '../../helpers/auth';

const BranchesCrud: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const OrganisationsApi = getEntityApi('Organisations');
  const BranchesApi = getEntityApi('Braches');
  const { items: organisationItems } = useDynamicSelector(
    OrganisationsApi.getIdentifier('GetAll')
  );
  const { items: branchItems } = useDynamicSelector(
    BranchesApi.getIdentifier('GetAll')
  );

  // Fetch organisations and branches data when component mounts
  useEffect(() => {
    OrganisationsApi('GetAll');
    // BranchesApi('GetAll');
  }, [OrganisationsApi, BranchesApi]);

  // State for selected organisation
  const [selectedOrg, setSelectedOrg] = useState<string | undefined>(undefined);

  // Filter branch options based on selected organisation
  const filteredBranches =
    branchItems?.result?.filter(
      (branch: any) => !selectedOrg || branch.organisation_id === selectedOrg
    ) || [];

  // Define filters inside the component so disabled updates with selectedOrg
  const filters = [
    {
      key: 'organisation_id',
      label: 'Organisation',
      type: 'select' as const,
      options:
        organisationItems?.result?.map((org: any) => ({
          label: org.org_name,
          value: org._id,
        })) || [],
      placeholder: 'Select Organisation',
      onChange: (value: string) => setSelectedOrg(value),
    },
    {
      key: 'branch_id',
      label: 'Branch',
      type: 'select' as const,
      options: filteredBranches.map((branch: any) => ({
        label: branch.branch_name,
        value: branch._id,
      })),
      placeholder: 'Select Branch',
      disabled: !selectedOrg,
    },
  ];

  const customButtons = [
    {
      key: 'export',
      label: 'Export',
      type: 'primary' as const,
      onClick: () => {
        // Implement export logic here
        alert('Export clicked!');
      },
    },
  ];
  const userRole = getCurrentUserRole();
  return (
    <GenericCrudPage
      config={{
        title: 'Branches',
        columns: brancheColumns,
        formItems: branchesFormItems(organisationItems?.result, userRole),
        apiRoutes: getEntityApiRoutes('Braches'),
        formColumns: 2,
      }}
      filters={filters}
      customButtons={customButtons}
    />
  );
};

export default BranchesCrud;
