import { useState, useMemo, useCallback } from 'react';
import { apiSlice } from '../services/redux/api/apiSlice';
import { getCurrentUser } from '../helpers/auth';
import SessionStorageEncryption from '../helpers/encryption';

export interface SuperAdminFiltersReturn {
  isSuperAdmin: boolean;
  isTenant: boolean;
  isOrganisationUser: boolean;
  isBranchUser: boolean;
  
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

  // Get user role - memoized to prevent infinite loops
  const userItem = useMemo(() => {
    return getCurrentUser();
  }, []);

  // Get user type from scope first (preferred), fallback to user_type
  const scopeData = useMemo(() => {
    return SessionStorageEncryption.getItem('scope');
  }, []);

  const userRole = useMemo(() => {
    return scopeData?.userType || userItem?.user_type || userItem?.usertype || userItem?.user_role || '';
  }, [scopeData, userItem]);

  const isSuperAdmin = useMemo(() => userRole.toLowerCase() === 'superadmin', [userRole]);
  const isTenant = useMemo(() => userRole.toLowerCase() === 'tenant', [userRole]);
  const isOrganisationUser = useMemo(() => userRole.toLowerCase() === 'organisationuser', [userRole]);
  const isBranchUser = useMemo(() => userRole.toLowerCase() === 'branchuser', [userRole]);

  // RTK Query hooks for dropdowns data
  const { data: tenantsData, isLoading: tenantsLoading, refetch: refetchTenants } =
    apiSlice.useGetTenantAccountsQuery(
      {},
      { skip: !isSuperAdmin }
    );
  const { data: organisationsData, isLoading: organisationsLoading, refetch: refetchOrganisations } =
    apiSlice.useGetOrganisationsQuery(
      {},
      { skip: !isSuperAdmin && !isTenant }
    );
  const { data: branchesData, isLoading: branchesLoading, refetch: refetchBranches } =
    apiSlice.useGetBranchesQuery(
      {},
      { skip: !isSuperAdmin && !isTenant && !isOrganisationUser }
    );

  // Extract items from RTK Query data
  const tenantsItems = (tenantsData as any)?.result || [];
  const organisationsItems = (organisationsData as any)?.result || [];
  const branchesItems = (branchesData as any)?.result || [];

  // Prepare dropdown options
  const tenantOptions = useMemo(() => {
    return tenantsItems?.map((tenant: any) => ({
      label: tenant.organization_name || tenant.contact_name || tenant.username,
      value: tenant._id,
    })) || [];
  }, [tenantsItems]);

  const organisationOptions = useMemo(() => {
    let orgs = organisationsItems || [];
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
    let branches = branchesItems || [];
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
    // RTK Query automatically refetches when skip conditions change
    // The filtering is done client-side in organisationOptions useMemo
  }, []);

  // Handle organisation change - reset branch filter
  const handleOrganisationChange = useCallback((value: string) => {
    setSelectedOrganisation(value);
    setSelectedBranch('all');
    // RTK Query automatically refetches when skip conditions change
    // The filtering is done client-side in branchOptions useMemo
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
    
    if ((isSuperAdmin || isTenant || isOrganisationUser) && selectedBranch && selectedBranch !== 'all') {
      filters.branch_id = selectedBranch;
    }
    
    return filters;
  }, [isSuperAdmin, isTenant, isOrganisationUser, selectedTenant, selectedOrganisation, selectedBranch]);

  return {
    isSuperAdmin,
    isTenant,
    isOrganisationUser,
    isBranchUser,
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

