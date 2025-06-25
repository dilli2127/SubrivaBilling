import React, { memo, useEffect, useState } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { usersAccountColumns } from './columns';
import { usersAccountFormItems } from './formItems';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux/selector';
import { Form } from 'antd';

const UserAccountCrud: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const apis = ['Roles', 'Organisations', 'Braches'].map(getEntityApi);
  const [RolesApi, OrganisationsApi, BrachesApi] = apis;
  const { items: rolesItems } = useDynamicSelector(
    RolesApi.getIdentifier('GetAll')
  );
  const { items: orgaisationItems } = useDynamicSelector(
    OrganisationsApi.getIdentifier('GetAll')
  );
  const { items: branchesItems } = useDynamicSelector(
    BrachesApi.getIdentifier('GetAll')
  );

  useEffect(() => {
    [RolesApi, OrganisationsApi].forEach(api => api('GetAll'));
  }, [RolesApi, OrganisationsApi]);

  // Prepare roles for the select
  const roles =
    rolesItems?.result?.map((role: any) => ({
      label: role.name,
      value: role._id,
    })) || [];
  const organisation =
    orgaisationItems?.result?.map((organisation: any) => ({
      label: organisation.org_name || organisation.name,
      value: organisation._id,
    })) || [];
  const branches =
    branchesItems?.result?.map((branch: any) => ({
      label: branch.branch_name || branch.name,
      value: branch._id,
      organisation_id: branch.organisation_id || branch.org_id, // ensure this property exists for filtering
    })) || [];

  // Dependent select logic
  const [form] = Form.useForm();
  const [selectedOrganisationId, setSelectedOrganisationId] = useState<
    string | number | null
  >(null);

  const handleOrganisationChange = (value: string | number | undefined) => {
    BrachesApi("GetAll",{organisation_id: value}); // Fetch branches for the selected organisation
    const safeValue = value === undefined || value === '' ? null : value;
    setSelectedOrganisationId(safeValue);
    form.setFieldsValue({ branch_id: undefined }); // reset branch when org changes
  };

  // Listen to organisation_id changes in the form
  const handleValuesChange = (changed: any, all: any) => {
    if (changed.organisation_id !== undefined)
      handleOrganisationChange(changed.organisation_id);
  };

  return (
    <GenericCrudPage
      config={{
        title: 'Users',
        columns: usersAccountColumns,
        formItems: usersAccountFormItems({
          roles,
          organisation,
          branches,
          selectedOrganisationId,
        }),
        apiRoutes: getEntityApiRoutes('BillingUsers'),
        formColumns: 2,
      }}
      onValuesChange={handleValuesChange}
    />
  );
};

export default memo(UserAccountCrud);
