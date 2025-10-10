import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { dynamic_request, useDynamicSelector } from '../services/redux';
import { CrudFormItem } from '../components/common/GenericCrudPage';
import { generateFormItemFromMetadata } from '../helpers/fieldMetadataUtils';
import { getEntityApiRoutes } from '../helpers/CrudFactory';

export interface FieldMetadata {
  _id: string;
  entity_name: string;
  field_name: string;
  business_type: string;
  field_type: string;
  label: string;
  placeholder?: string;
  is_required: boolean;
  validation_rules?: {
    options?: string[];
    min?: number;
    max?: number;
    pattern?: string;
    patternMessage?: string;
    email?: boolean;
  };
  display_order: number;
  is_active: boolean;
  is_global: boolean;
  tenant_id?: string;
  organisation_id?: string;
  options?: string[]; // For select/radio fields (legacy support)
}

interface UseFieldMetadataOptions {
  entityName: string;
  staticFormItems: CrudFormItem[];
  enabled?: boolean;
  businessType?: string;
}

/**
 * Custom hook to fetch and merge dynamic field metadata with static form items
 * @param options Configuration options
 * @returns Merged form items, loading state, and refresh function
 */
export const useFieldMetadata = ({
  entityName,
  staticFormItems,
  enabled = true,
  businessType,
}: UseFieldMetadataOptions) => {
  const dispatch = useDispatch();

  // Use generic API routes instead of hardcoded endpoint
  const apiRoutes = useMemo(() => getEntityApiRoutes('FieldMetadata'), []);

  // Create a unique identifier for this entity's metadata
  const identifier = useMemo(
    () => `${apiRoutes.get.identifier}_${entityName}`,
    [apiRoutes.get.identifier, entityName]
  );

  // Fetch field metadata from Redux
  const { items: metadataResponse, loading } = useDynamicSelector(identifier);

  /**
   * Fetch field metadata for the given entity
   */
  const fetchFieldMetadata = useCallback(() => {
    if (!enabled) return;

    const requestData: any = {
      entity_name: entityName,
      is_active: true, // Only fetch active fields
    };

    // Add business_type filter if provided
    if (businessType) {
      requestData.business_type = businessType;
    }

    dispatch(
      dynamic_request(
        {
          method: apiRoutes.get.method,
          endpoint: apiRoutes.get.endpoint,
          data: requestData,
        },
        identifier
      ) as any
    );
  }, [dispatch, entityName, businessType, enabled, apiRoutes.get, identifier]);

  /**
   * Memoized dynamic fields - sorted and filtered
   */
  const dynamicFields = useMemo<FieldMetadata[]>(() => {
    if (!metadataResponse?.result) return [];

    const fields: FieldMetadata[] = metadataResponse.result;

    // Filter active fields and sort by display_order
    return fields
      .filter((field) => field.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }, [metadataResponse?.result]);

  /**
   * Convert dynamic fields to form items
   */
  const dynamicFormItems = useMemo<CrudFormItem[]>(() => {
    return dynamicFields.map((field) => generateFormItemFromMetadata(field));
  }, [dynamicFields]);

  /**
   * Merge static and dynamic form items
   * Strategy: Static items first, then dynamic items (can be customized)
   */
  const mergedFormItems = useMemo<CrudFormItem[]>(() => {
    // If no dynamic fields, return static items as-is
    if (dynamicFormItems.length === 0) {
      return staticFormItems;
    }

    // Merge: static items first, then dynamic items
    // You can customize this logic based on your needs
    return [...staticFormItems, ...dynamicFormItems];
  }, [staticFormItems, dynamicFormItems]);

  /**
   * Fetch metadata on mount and when dependencies change
   */
  useEffect(() => {
    if (enabled) {
      fetchFieldMetadata();
    }
  }, [enabled, fetchFieldMetadata]);

  return {
    /** Merged form items (static + dynamic) */
    formItems: mergedFormItems,
    
    /** Loading state */
    loading,
    
    /** Refresh/refetch function */
    refresh: fetchFieldMetadata,
    
    /** Raw dynamic fields metadata */
    dynamicFields,
    
    /** Dynamic form items only (without static) */
    dynamicFormItems,
    
    /** Static form items only */
    staticFormItems,
  };
};

/**
 * Hook to fetch field metadata without merging with static items
 * Useful for standalone field metadata management
 */
export const useFieldMetadataOnly = (entityName: string, enabled = true) => {
  const dispatch = useDispatch();
  const apiRoutes = useMemo(() => getEntityApiRoutes('FieldMetadata'), []);
  const identifier = useMemo(
    () => `${apiRoutes.get.identifier}_${entityName}`,
    [apiRoutes.get.identifier, entityName]
  );

  const { items: metadataResponse, loading } = useDynamicSelector(identifier);

  const fetchFieldMetadata = useCallback(() => {
    if (!enabled) return;

    dispatch(
      dynamic_request(
        {
          method: apiRoutes.get.method,
          endpoint: apiRoutes.get.endpoint,
          data: { entity_name: entityName },
        },
        identifier
      ) as any
    );
  }, [dispatch, entityName, enabled, apiRoutes.get, identifier]);

  const fields = useMemo<FieldMetadata[]>(() => {
    return metadataResponse?.result || [];
  }, [metadataResponse?.result]);

  useEffect(() => {
    if (enabled) {
      fetchFieldMetadata();
    }
  }, [enabled, fetchFieldMetadata]);

  return {
    fields,
    loading,
    refresh: fetchFieldMetadata,
  };
};
