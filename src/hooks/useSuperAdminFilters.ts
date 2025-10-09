import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApiActions } from '../services/api/useApiActions';
import { useDynamicSelector } from '../services/redux';

export interface SuperAdminFiltersReturn {
  isSuperAdmin: boolean;
  isTenant: boolean;
  
  // Selected values
  selectedTenant: string;
  selectedOrganisation: string;
  selectedBranch: string;
  
  // Dropdown options
  tenantOptions: Array<{ label: string; value: string }>;
  organisationOptions: Array<{ label: string; value: string }>;
  branchOptions: Array<{ label: string; value: string }>;
  
  // Change handlers
  handleTenantChange: (value: string) => void;
  handleOrganisationChange: (value: string) => void;
  handleBranchChange: (value: string) => void;
  
  // Loading states
  tenantsLoading: boolean;
  organisationsLoading: boolean;
  branchesLoading: boolean;
  
  // Filters object for API calls
  getApiFilters: () => Record<string, any>;
}

export const useSuperAdminFilters = (): SuperAdminFiltersReturn => {
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedOrganisation, setSelectedOrganisation] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  // Get user role
  const userItem = useMemo(() => {
    const data = sessionStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }, []);

  const userRole = userItem?.roleItems?.name || userItem?.usertype || userItem?.user_role || '';
  const isSuperAdmin = userRole.toLowerCase() === 'superadmin';
  const isTenant = userRole.toLowerCase() === 'tenant';

  // API hooks
  const { getEntityApi } = useApiActions();
  const TenantsApi = getEntityApi('Tenant');
  const OrganisationsApi = getEntityApi('Organisations');
  const BranchesApi = getEntityApi('Braches');

  // Selectors for dropdowns data
  const { items: tenantsItems, loading: tenantsLoading } = useDynamicSelector(
    TenantsApi.getIdentifier('GetAll')
  );
  const { items: organisationsItems, loading: organisationsLoading } = useDynamicSelector(
    OrganisationsApi.getIdentifier('GetAll')
  );
  const { items: branchesItems, loading: branchesLoading } = useDynamicSelector(
    BranchesApi.getIdentifier('GetAll')
  );

  // Fetch data on mount
  useEffect(() => {
    if (isSuperAdmin) {
      // SuperAdmin: Only fetch tenants initially
      TenantsApi('GetAll');
    } else if (isTenant) {
      // Tenant: Fetch organisations on mount
      OrganisationsApi('GetAll');
    } else {
      // OrganisationAdmin/BranchAdmin: Fetch branches on mount
      BranchesApi('GetAll');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, isTenant]);

  // Prepare dropdown options
  const tenantOptions = useMemo(() => {
    return tenantsItems?.result?.map((tenant: any) => ({
      label: tenant.organization_name || tenant.contact_name || tenant.username,
      value: tenant._id,
    })) || [];
  }, [tenantsItems]);

  const organisationOptions = useMemo(() => {
    let orgs = organisationsItems?.result || [];
    // Filter by selected tenant if applicable
    if (isSuperAdmin && selectedTenant !== 'all') {
      orgs = orgs.filter((org: any) => org.tenant_id === selectedTenant);
    }
    return orgs.map((org: any) => ({
      label: org.org_name || org.name,
      value: org._id,
    }));
  }, [organisationsItems, selectedTenant, isSuperAdmin]);

  const branchOptions = useMemo(() => {
    let branches = branchesItems?.result || [];
    // Filter by selected organisation if applicable
    if (selectedOrganisation !== 'all') {
      branches = branches.filter(
        (branch: any) =>
          branch.organisation_id === selectedOrganisation ||
          branch.org_id === selectedOrganisation
      );
    }
    return branches.map((branch: any) => ({
      label: branch.branch_name || branch.name,
      value: branch._id,
    }));
  }, [branchesItems, selectedOrganisation]);

  // Handle tenant change - reset dependent filters
  const handleTenantChange = useCallback((value: string) => {
    setSelectedTenant(value);
    setSelectedOrganisation('all');
    setSelectedBranch('all');
    // Fetch organisations for selected tenant (with tenant_id filter)
    if (value !== 'all') {
      OrganisationsApi('GetAll', { tenant_id: value });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle organisation change - reset branch filter
  const handleOrganisationChange = useCallback((value: string) => {
    setSelectedOrganisation(value);
    setSelectedBranch('all');
    // Fetch branches for selected organisation (with organisation_id filter)
    if (value !== 'all') {
      BranchesApi('GetAll', { organisation_id: value });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle branch change
  const handleBranchChange = useCallback((value: string) => {
    setSelectedBranch(value);
  }, []);

  // Generate API filters based on selections
  const getApiFilters = useCallback(() => {
    const filters: Record<string, any> = {};
    
    if (isSuperAdmin) {
      if (selectedTenant && selectedTenant !== 'all') {
        filters.tenant_id = selectedTenant;
      }
    }
    
    if ((isSuperAdmin || isTenant) && selectedOrganisation && selectedOrganisation !== 'all') {
      filters.organisation_id = selectedOrganisation;
      filters.org_id = selectedOrganisation; // Some APIs use org_id
    }
    
    if (selectedBranch && selectedBranch !== 'all') {
      filters.branch_id = selectedBranch;
    }
    
    return filters;
  }, [isSuperAdmin, isTenant, selectedTenant, selectedOrganisation, selectedBranch]);

  return {
    isSuperAdmin,
    isTenant,
    selectedTenant,
    selectedOrganisation,
    selectedBranch,
    tenantOptions,
    organisationOptions,
    branchOptions,
    handleTenantChange,
    handleOrganisationChange,
    handleBranchChange,
    tenantsLoading,
    organisationsLoading,
    branchesLoading,
    getApiFilters,
  };
};

