import { useCallback, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dispatch } from 'redux';
import { dynamic_request, useDynamicSelector } from '../../../services/redux';
import { createApiRouteGetter } from '../../../helpers/Common_functions';
import { getCurrentUserRole } from '../../../helpers/auth';
import { EntityDefinition, UseEntityExplorerReturn } from '../types';

/**
 * Custom hook for Entity Explorer functionality
 * Handles entity definitions fetching, user permissions, and navigation
 */
export const useEntityExplorer = (): UseEntityExplorerReturn => {
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();

  // Get current user role for permission checks
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = useMemo(() => 
    currentUserRole?.toLowerCase() === 'superadmin', 
    [currentUserRole]
  );

  // Memoized API route getter
  const getApiRoute = useMemo(() => createApiRouteGetter('EntityDefinition'), []);
  const entityRoute = useMemo(() => getApiRoute('Get'), [getApiRoute]);

  // Fetch entity definitions
  const { loading, items } = useDynamicSelector(entityRoute.identifier);

  // Memoized entities list
  const entities = useMemo<EntityDefinition[]>(() => {
    return items?.result || [];
  }, [items?.result]);

  // Fetch entity definitions on mount
  const fetchEntities = useCallback(() => {
    dispatch(
      dynamic_request(
        {
          method: entityRoute.method,
          endpoint: entityRoute.endpoint,
          data: { is_active: true },
        },
        entityRoute.identifier
      )
    );
  }, [dispatch, entityRoute]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

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
