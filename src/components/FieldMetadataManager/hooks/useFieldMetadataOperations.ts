import { useCallback, useEffect, useMemo } from 'react';
import { apiSlice } from '../../../services/redux/api/apiSlice';
import { FieldMetadata } from '../../../hooks/useFieldMetadata';
import { validateFieldMetadata } from '../../../helpers/fieldMetadataUtils';
import { showToast } from '../../../helpers/Common_functions';
import {
  UseFieldMetadataOperationsProps,
  UseFieldMetadataOperationsReturn,
} from '../types';

export const useFieldMetadataOperations = ({
  entityName,
  businessType,
  tenantId,
  organisationId,
  onFieldsUpdated,
  enabled = true, // Add enabled parameter to control when query should run
}: UseFieldMetadataOperationsProps & { enabled?: boolean }): UseFieldMetadataOperationsReturn => {
  // Prepare query params - exclude undefined values for proper caching
  const queryParams = useMemo(() => {
    const params: any = {
      entity_name: entityName,
      // Omit is_active to get all fields (active and inactive)
      // Only include it if we want to filter by active status
    };
    return params;
  }, [entityName]);

  // Use RTK Query for fetching fields - skip query when not enabled
  const { data: fieldsResponse, isLoading: fieldsLoading, refetch: refetchFields } = apiSlice.useGetFieldMetadataQuery(
    queryParams,
    {
      skip: !enabled, // Skip query when modal is not visible
    }
  );

  // Use RTK Query mutations
  const [createField, { isLoading: createLoading }] = apiSlice.useCreateFieldMetadataMutation();
  const [updateField, { isLoading: updateLoading }] = apiSlice.useUpdateFieldMetadataMutation();
  const [deleteField, { isLoading: deleteLoading }] = apiSlice.useDeleteFieldMetadataMutation();

  // Fetch field metadata (refetch function)
  const fetchFields = useCallback(() => {
    refetchFields();
  }, [refetchFields]);

  // Success handling is done in the mutation handlers below
  // RTK Query provides isLoading states for each mutation

  // Submit field (create or update)
  const handleSubmitField = useCallback(
    async (values: any, optionsText: string, editingField: FieldMetadata | null) => {
      // Build validation rules
      const validationRules: any = {};
      const fieldType = values.field_type;

      // Handle options for select/radio fields
      if (['select', 'multiselect', 'radio'].includes(fieldType)) {
        const options = optionsText
          .split('\n')
          .map((opt) => opt.trim())
          .filter((opt) => opt.length > 0);

        if (options.length === 0) {
          showToast('error', 'Please provide at least one option');
          return;
        }
        validationRules.options = options;
      }

      // Add number validation rules
      if (values.min !== undefined && values.min !== null) {
        validationRules.min = values.min;
      }
      if (values.max !== undefined && values.max !== null) {
        validationRules.max = values.max;
      }

      // Build payload
      const payload: any = {
        entity_name: values.entity_name,
        field_name: values.field_name,
        business_type: values.business_type || businessType,
        field_type: values.field_type,
        label: values.label,
        placeholder: values.placeholder,
        is_required: values.is_required || false,
        validation_rules: validationRules,
        display_order: values.display_order || 0,
        is_active: values.is_active !== false,
        is_global: values.is_global || false,
      };

      if (tenantId) payload.tenant_id = tenantId;
      if (organisationId) payload.organisation_id = organisationId;

      // Validate before submission
      const errors = validateFieldMetadata(payload);
      if (errors.length > 0) {
        showToast('error', errors[0]); // Show first error
        return;
      }

      // Submit using RTK Query mutations
      try {
        if (editingField) {
          await updateField({ id: editingField._id, ...payload }).unwrap();
          showToast('success', 'Field updated successfully');
        } else {
          await createField(payload).unwrap();
          showToast('success', 'Field created successfully');
        }
        
        // Refetch fields after successful create/update
        refetchFields();
        if (onFieldsUpdated) {
          onFieldsUpdated();
        }
      } catch (error: any) {
        showToast('error', error?.data?.message || `Failed to ${editingField ? 'update' : 'create'} field`);
      }
    },
    [businessType, tenantId, organisationId, createField, updateField, refetchFields, onFieldsUpdated]
  );

  // Delete field
  const handleDeleteField = useCallback(
    async (fieldId: string) => {
      try {
        await deleteField(fieldId).unwrap();
        showToast('success', 'Field deleted successfully');
        // Refetch fields after successful delete
        refetchFields();
        if (onFieldsUpdated) {
          onFieldsUpdated();
        }
      } catch (error: any) {
        showToast('error', error?.data?.message || 'Failed to delete field');
      }
    },
    [deleteField, refetchFields, onFieldsUpdated]
  );

  // Memoized fields data
  const fieldsData = useMemo(() => {
    const data = (fieldsResponse as any)?.result || fieldsResponse || [];
    return Array.isArray(data) ? data : [];
  }, [fieldsResponse]);

  return {
    fieldsData,
    fieldsLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    fetchFields,
    handleSubmitField,
    handleDeleteField,
  };
};

