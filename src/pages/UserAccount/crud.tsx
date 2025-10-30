import React, { memo, useMemo, useState } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { usersAccountColumns } from './columns';
import { usersAccountFormItems } from './formItems';
import { Form } from 'antd';
import { getCurrentUser } from '../../helpers/auth';
import { apiSlice } from '../../services/redux/api/apiSlice';
import { useSuperAdminFilters } from '../../hooks/useSuperAdminFilters';

const UserAccountCrud: React.FC = () => {
  // Use RTK Query for fetching related data
  const { data: rolesData } = apiSlice.useGetRolesQuery({});
  // Use centralised options for organisations to honour tenant selection and lazy load
  const { organisationOptions } = useSuperAdminFilters();

  // Branches should load only after organisation selection
  const [form] = Form.useForm();
  const [selectedOrganisationId, setSelectedOrganisationId] = useState<
    string | number | null
  >(null);
  const { data: branchesData } = apiSlice.useGetBranchesQuery(
    selectedOrganisationId
      ? { organisation_id: selectedOrganisationId, org_id: selectedOrganisationId }
      : {},
    { skip: !selectedOrganisationId }
  );

  const rolesItems = useMemo(() => (rolesData as any)?.result || [], [rolesData]);
  const orgaisationItems = useMemo(
    () => organisationOptions.map(o => ({ _id: o.value, org_name: o.label, name: o.label })),
    [organisationOptions]
  );
  const branchesItems = useMemo(() => (branchesData as any)?.result || [], [branchesData]);
  
  const userItem = useMemo(() => {
    return getCurrentUser();
  }, []);

  const userItemRole = useMemo(() =>
    userItem?.roleItems?.name ||
    userItem?.usertype ||
    userItem?.user_role ||
    '', [userItem]);

  // Memoize select options to prevent recreation
  const roles = useMemo(() =>
    rolesItems?.map((role: any) => ({
      label: role.name,
      value: role._id,
    })) || [], [rolesItems]);
    
  const organisation = useMemo(() =>
    orgaisationItems?.map((organisation: any) => ({
      label: organisation.org_name || organisation.name,
      value: organisation._id,
    })) || [], [orgaisationItems]);
    
  const branches = useMemo(() =>
    branchesItems?.map((branch: any) => ({
      label: branch.branch_name || branch.name,
      value: branch._id,
      organisation_id: branch.organisation_id || branch.org_id, // ensure this property exists for filtering
    })) || [], [branchesItems]);

  // Dependent select logic
  // form is already created above for listening to changes

  const handleOrganisationChange = (value: string | number | undefined) => {
    // RTK Query automatically handles data fetching, no need for manual API calls
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
          userItemRole,
        }),
        entityName: 'BillingUsers',
        formColumns: 2,
      }}
      onValuesChange={handleValuesChange}
      enableDynamicFields={true}
      entityName="users"
    />
  );
};

export default memo(UserAccountCrud);
