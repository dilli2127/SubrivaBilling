import React, { memo, useEffect } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { rolesFormItems } from './formItems';
import { rolesColumns } from './columns';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux/selector';

const RolesCrud: React.FC = () => {
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

  return (
    <GenericCrudPage
      config={{
        title: 'Roles',
        columns: rolesColumns,
        formItems: rolesFormItems(),
        apiRoutes: getEntityApiRoutes('Roles'),
        formColumns: 2,
      }}
      filters={filters}
    />
  );
};

export default memo(RolesCrud);
