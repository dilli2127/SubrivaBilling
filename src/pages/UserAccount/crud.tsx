import React, { memo, useEffect } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { usersAccountColumns } from './columns';
import { usersAccountFormItems } from './formItems';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux/selector';

const UserAccountCrud: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const RolesApi = getEntityApi('Roles');
  const Organisations = getEntityApi('Organisations');
  const Braches = getEntityApi('Braches');
  const { items: rolesItems } = useDynamicSelector(RolesApi.getIdentifier('GetAll'));

  useEffect(() => {
    RolesApi('GetAll');
    Organisations("GetAll");
    Braches('GetAll');
  }, [RolesApi]);

  // Prepare roles for the select
  const roles =
    rolesItems?.result?.map((role: any) => ({
      label: role.name,
      value: role._id,
    })) || [];

  return (
    <GenericCrudPage
      config={{
        title: 'Users',
        columns: usersAccountColumns,
        formItems: usersAccountFormItems(roles),
        apiRoutes: getEntityApiRoutes('BillingUsers'),
        formColumns: 2,
      }}
    />
  );
};

export default memo(UserAccountCrud);
