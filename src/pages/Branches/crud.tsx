import React, { useEffect } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { branchesFormItems } from './formItems';
import { brancheColumns } from './columns';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux/selector';
import { useGenericCrud } from '../../hooks/useGenericCrud';

const BrachesCrud: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const OrganisationsApi = getEntityApi('Organisations');
  const { items: organisationItems, loading: orgLoading } = useDynamicSelector(
    OrganisationsApi.getIdentifier('GetAll')
  );

  // Use the hook and get setFilterValues
  const crud = useGenericCrud({
    title: 'Branches',
    columns: brancheColumns,
    formItems: branchesFormItems(organisationItems?.result),
    apiRoutes: getEntityApiRoutes('Braches'),
    formColumns: 2,
  });

  useEffect(() => {
    OrganisationsApi('GetAll');
  }, [OrganisationsApi]);

  // Example filter and button configs
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
    },
    {
      key: 'branchName',
      label: 'Branch Name',
      type: 'input' as const,
      placeholder: 'Branch Name',
    },
  ];

  const customButtons = [
    {
      key: 'export',
      label: 'Export',
      type: 'default' as const,
      onClick: () => {
        // Implement export logic here
        alert('Export clicked!');
      },
    },
  ];

  return (
    <GenericCrudPage
      config={{
        title: 'Branches',
        columns: brancheColumns,
        formItems: branchesFormItems(organisationItems?.result),
        apiRoutes: getEntityApiRoutes('Braches'),
        formColumns: 2,
      }}
      filters={filters}
      onFilterChange={crud.setFilterValues}
      customButtons={customButtons}
    />
  );
};

export default BrachesCrud;
