import { useCallback, useEffect, useMemo } from 'react';
import { apiSlice } from '../services/redux/api/apiSlice';
import { CrudFormItem } from '../components/common/GenericCrudPage';
import { generateFormItemFromMetadata } from '../helpers/fieldMetadataUtils';

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
  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      entity_name: entityName,
      is_active: true, // Only fetch active fields
    };

    // Add business_type filter if provided
    if (businessType) {
      params.business_type = businessType;
    }

    return params;
  }, [entityName, businessType]);

  // Use RTK Query to fetch field metadata
  const { data: metadataResponse, isLoading: loading, refetch: refetchFieldMetadata } = apiSlice.useGetFieldMetadataQuery(
    queryParams,
    { skip: !enabled }
  );

  /**
   * Memoized dynamic fields - sorted and filtered
   */
  const dynamicFields = useMemo<FieldMetadata[]>(() => {
    const fieldsData = (metadataResponse as any)?.result || metadataResponse || [];
    const fields: FieldMetadata[] = Array.isArray(fieldsData) ? fieldsData : [];

    // Filter active fields and sort by display_order
    return fields
      .filter((field) => field.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }, [metadataResponse]);

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

  // RTK Query automatically fetches when enabled changes
  // No manual useEffect needed

  return {
    /** Merged form items (static + dynamic) */
    formItems: mergedFormItems,
    
    /** Loading state */
    loading,
    
    /** Refresh/refetch function */
    refresh: refetchFieldMetadata,
    
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
  // Use RTK Query to fetch field metadata
  const { data: metadataResponse, isLoading: loading, refetch: refetchFieldMetadata } = apiSlice.useGetFieldMetadataQuery(
    { entity_name: entityName },
    { skip: !enabled }
  );

  const fields = useMemo<FieldMetadata[]>(() => {
    const fieldsData = (metadataResponse as any)?.result || metadataResponse || [];
    return Array.isArray(fieldsData) ? fieldsData : [];
  }, [metadataResponse]);

  return {
    fields,
    loading,
    refresh: refetchFieldMetadata,
  };
};
