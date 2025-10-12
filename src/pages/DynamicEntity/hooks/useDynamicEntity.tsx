import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Dispatch } from 'redux';
import { dynamic_request, useDynamicSelector } from '../../../services/redux';
import { createApiRouteGetter } from '../../../helpers/Common_functions';

export interface EntityDefinition {
  _id: string;
  entity_name: string;
  display_name: string;
  plural_name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  is_global: boolean;
  tenant_id?: string;
  organisation_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicApiRoutes {
  get: { method: string; endpoint: string; identifier: string };
  create: { method: string; endpoint: string; identifier: string };
  update: { method: string; endpoint: string; identifier: string };
  delete: { method: string; endpoint: string; identifier: string };
}

/**
 * Custom hook for managing dynamic entity operations
 * Handles entity definition fetching, API route generation, and entity validation
 */
export const useDynamicEntity = () => {
  const { entityName } = useParams<{ entityName: string }>();
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const [entityDef, setEntityDef] = useState<EntityDefinition | null>(null);

  // Memoized API route getter to prevent recreation
  const getApiRoute = useMemo(() => createApiRouteGetter('EntityDefinition'), []);
  const entityDefRoute = useMemo(() => getApiRoute('Get'), [getApiRoute]);

  // Fetch entity definition data
  const { loading, items, error } = useDynamicSelector(entityDefRoute.identifier);

  // Fetch entity definition when entityName changes
  const fetchEntityDefinition = useCallback(() => {
    if (entityName) {
      dispatch(
        dynamic_request(
          {
            method: entityDefRoute.method,
            endpoint: entityDefRoute.endpoint,
            data: { entity_name: entityName },
          },
          entityDefRoute.identifier
        )
      );
    }
  }, [entityName, dispatch, entityDefRoute]);

  // Update entity definition when data changes
  useEffect(() => {
    if (items?.result && Array.isArray(items.result) && items.result.length > 0) {
      const definition = items.result[0];
      setEntityDef(definition);
    }
  }, [items]);

  // Fetch on mount and when entityName changes
  useEffect(() => {
    fetchEntityDefinition();
  }, [fetchEntityDefinition]);

  // Generate optimized API routes for dynamic entity
  const dynamicApiRoutes = useMemo<DynamicApiRoutes | null>(() => {
    if (!entityName) return null;
    
    const baseEndpoint = `/${entityName}`;
    
    return {
      get: {
        method: 'POST',
        endpoint: baseEndpoint,
        identifier: `GetAll_${entityName}`,
      },
      create: {
        method: 'PUT',
        endpoint: baseEndpoint,
        identifier: `Add_${entityName}`,
      },
      update: {
        method: 'POST',
        endpoint: baseEndpoint,
        identifier: `Update_${entityName}`,
      },
      delete: {
        method: 'DELETE',
        endpoint: baseEndpoint,
        identifier: `Delete_${entityName}`,
      },
    };
  }, [entityName]);

  // Optimized columns configuration
  const defaultColumns = useMemo(() => [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 100,
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {text.substring(0, 8)}...
        </span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ], []);

  // Validation helpers
  const isEntityValid = useMemo(() => {
    return entityDef && entityDef.is_active;
  }, [entityDef]);

  const hasError = useMemo(() => {
    return error || (!loading && !isEntityValid);
  }, [error, loading, isEntityValid]);

  // Navigation helpers
  const goBack = useCallback(() => {
    navigate('/entities');
  }, [navigate]);

  const goToEntityDefinitions = useCallback(() => {
    navigate('/entity-definitions');
  }, [navigate]);

  return {
    // State
    entityName,
    entityDef,
    loading,
    error,
    hasError,
    isEntityValid,
    
    // Computed
    dynamicApiRoutes,
    defaultColumns,
    
    // Actions
    fetchEntityDefinition,
    goBack,
    goToEntityDefinitions,
    
    // Helpers
    entityDefRoute,
  };
};
