import React, { memo, useEffect } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { rolesFormItems } from './formItems';
import { rolesColumns } from './columns';

const RolesCrud: React.FC = () => {
  return (
    <GenericCrudPage
      config={{
        title: 'Roles',
        columns: rolesColumns,
        formItems: rolesFormItems(),
        apiRoutes: getEntityApiRoutes('Roles'),
        formColumns: 2,
      }}
    />
  );
};

export default memo(RolesCrud);
