import React, { memo, useEffect } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { usersAccountColumns } from './columns';
import { usersAccountFormItems } from './formItems';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux/selector';

const UserAccountCrud: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const apis = ['Roles', 'Organisations', 'Braches'].map(getEntityApi);
  const [RolesApi, OrganisationsApi, BrachesApi] = apis;
  const { items: rolesItems } = useDynamicSelector(RolesApi.getIdentifier('GetAll'));
  const { items: orgaisationItems } = useDynamicSelector(OrganisationsApi.getIdentifier('GetAll'));
  const { items: branchesItems } = useDynamicSelector(BrachesApi.getIdentifier('GetAll'));

  useEffect(() => {
    [RolesApi, OrganisationsApi, BrachesApi].forEach(api => api('GetAll'));
  }, [RolesApi, OrganisationsApi, BrachesApi]);

  // Prepare roles for the select
  const roles =
    rolesItems?.result?.map((role: any) => ({
      label: role.name,
      value: role._id,
    })) || [];
    const organisation =
    orgaisationItems?.result?.map((organisation: any) => ({
      label: organisation.org_name,
      value: organisation._id,
    })) || [];
    
    const branches =
    branchesItems?.result?.map((branch: any) => ({
      label: branch.branch_name,
      value: branch._id,
    })) || [];
  return (
    <GenericCrudPage
      config={{
        title: 'Users',
        columns: usersAccountColumns,
        formItems: usersAccountFormItems({ roles, organisation, branches }),
        apiRoutes: getEntityApiRoutes('BillingUsers'),
        formColumns: 2,
      }}
    />
  );
};

export default memo(UserAccountCrud);
