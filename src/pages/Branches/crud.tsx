import React, { useEffect } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { branchesFormItems } from './formItems';
import { brancheColumns } from './columns';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux/selector';

const BranchesCrud: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const OrganisationsApi = getEntityApi('Organisations');
  const { items: organisationItems } = useDynamicSelector(
    OrganisationsApi.getIdentifier('GetAll')
  );

  useEffect(() => {
    OrganisationsApi('GetAll');
  }, [OrganisationsApi]);

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
      customButtons={customButtons}
    />
  );
};

export default BranchesCrud;
