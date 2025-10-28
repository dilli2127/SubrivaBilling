import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiSlice } from '../../../services/redux/api/apiSlice';
import { getCurrentUserRole } from '../../../helpers/auth';
import { EntityDefinition, UseEntityExplorerReturn } from '../types';

/**
 * Custom hook for Entity Explorer functionality
 * Handles entity definitions fetching, user permissions, and navigation
 */
export const useEntityExplorer = (): UseEntityExplorerReturn => {
  const navigate = useNavigate();

  // Get current user role for permission checks
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = useMemo(() => {
    const role = currentUserRole?.toLowerCase();
    return role === 'superadmin' || role === 'tenant' || role === 'admin';
  }, [currentUserRole]);

  // Use RTK Query to fetch entity definitions
  const { data: entityDefData, isLoading: loading, refetch: fetchEntities } = apiSlice.useGetEntityDefinitionQuery(
    { is_active: true },
    {}
  );

  // Memoized entities list
  const entities = useMemo<EntityDefinition[]>(() => {
    const data = (entityDefData as any)?.result || entityDefData || [];
    return Array.isArray(data) ? data : [];
  }, [entityDefData]);

  // Navigation handlers
  const navigateToEntity = useCallback((entityName: string) => {
    navigate(`/dynamic-entity/${entityName}`);
  }, [navigate]);

  const navigateToDefinitions = useCallback(() => {
    navigate('/entity-definitions');
  }, [navigate]);

  // Computed values
  const hasEntities = useMemo(() => entities.length > 0, [entities.length]);
  const isLoading = loading;

  // Entity route (for backward compatibility, using RTK Query identifier)
  const entityRoute = useMemo(() => ({
    identifier: 'GetEntityDefinition',
    method: 'POST',
    endpoint: '/entity_definition',
  }), []);

  return {
    // State
    entities,
    loading: isLoading,
    hasEntities,
    
    // Permissions
    isSuperAdmin,
    
    // Actions
    navigateToEntity,
    navigateToDefinitions,
    fetchEntities,
    
    // Computed
    entityRoute,
  };
};
