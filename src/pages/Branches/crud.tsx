import React, { useEffect } from 'react';
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
  const { items: organisationItems } = useDynamicSelector(
    OrganisationsApi.getIdentifier('GetAll')
  );

  useEffect(() => {
    OrganisationsApi('GetAll');
  }, [OrganisationsApi]);

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
        columns: brancheColumns,
        formItems: branchesFormItems(organisationItems?.result, userRole),
        apiRoutes: getEntityApiRoutes('Braches'),
        formColumns: 2,
      }}
      customButtons={customButtons}
    />
  );
};

export default BranchesCrud;
