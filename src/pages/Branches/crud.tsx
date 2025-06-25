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

  return (
    <GenericCrudPage
      config={{
        title: 'Branches',
        columns: brancheColumns,
        formItems: branchesFormItems(organisationItems?.result),
        apiRoutes: getEntityApiRoutes('Braches'),
        formColumns: 2,
      }}
      onFilterChange={crud.setFilterValues}
    />
  );
};

export default BrachesCrud;
