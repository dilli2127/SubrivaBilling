import React, { useEffect } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { branchesFormItems } from './formItems';
import { brancheColumns } from './columns';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux/selector';

const BrachesCrud: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const OrganisationsApi = getEntityApi('Organisations');
  const { items: organisationItems, loading: orgLoading } = useDynamicSelector(
    OrganisationsApi.getIdentifier('GetAll')
  );

  useEffect(() => {
    OrganisationsApi('GetAll');
  }, [OrganisationsApi]);

  return (
    <GenericCrudPage
      config={{
        title: 'Branches',
        columns: brancheColumns,
        formItems: branchesFormItems(organisationItems?.result),
        apiRoutes: getEntityApiRoutes('Braches'),
        formColumns: 2,
      }}
    />
  );
};

export default BrachesCrud;
