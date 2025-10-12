import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { dynamic_request, useDynamicSelector, dynamic_clear } from '../../../services/redux';
import { FieldMetadata } from '../../../hooks/useFieldMetadata';
import { validateFieldMetadata } from '../../../helpers/fieldMetadataUtils';
import { showToast } from '../../../helpers/Common_functions';
import { getEntityApiRoutes } from '../../../helpers/CrudFactory';
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
}: UseFieldMetadataOperationsProps): UseFieldMetadataOperationsReturn => {
  const dispatch = useDispatch();

  // Get API routes using the generic helper (memoized)
  const apiRoutes = useMemo(() => getEntityApiRoutes('FieldMetadata'), []);

  // Redux selectors using the identifiers from API routes
  const { items: fieldsResponse, loading: fieldsLoading } = useDynamicSelector(
    apiRoutes.get.identifier
  );
  const { items: createResponse, loading: createLoading } = useDynamicSelector(
    apiRoutes.create.identifier
  );
  const { items: updateResponse, loading: updateLoading } = useDynamicSelector(
    apiRoutes.update.identifier
  );
  const { items: deleteResponse, loading: deleteLoading } = useDynamicSelector(
    apiRoutes.delete.identifier
  );

  // Fetch field metadata
  const fetchFields = useCallback(() => {
    dispatch(
      dynamic_request(
        {
          method: apiRoutes.get.method,
          endpoint: apiRoutes.get.endpoint,
          data: {
            entity_name: entityName,
            is_active: undefined, // Get all fields (active and inactive)
          },
        },
        apiRoutes.get.identifier
      ) as any
    );
  }, [dispatch, entityName, apiRoutes.get]);

  // Combined success handler for create/update/delete
  useEffect(() => {
    const handleSuccess = (
      response: any,
      action: 'created' | 'updated' | 'deleted',
      identifier: string
    ) => {
      if (response?.statusCode === 200) {
        showToast('success', `Field ${action} successfully`);
        // Only fetch fields for the modal view
        fetchFields();
        // Clear the request state
        dispatch(dynamic_clear(identifier) as any);
      }
    };

    handleSuccess(createResponse, 'created', apiRoutes.create.identifier);
    handleSuccess(updateResponse, 'updated', apiRoutes.update.identifier);
    handleSuccess(deleteResponse, 'deleted', apiRoutes.delete.identifier);
  }, [
    createResponse,
    updateResponse,
    deleteResponse,
    fetchFields,
    dispatch,
    apiRoutes.create.identifier,
    apiRoutes.update.identifier,
    apiRoutes.delete.identifier,
  ]);

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

      // Submit
      const requestConfig = editingField
        ? {
            method: apiRoutes.update.method,
            endpoint: `${apiRoutes.update.endpoint}/${editingField._id}`,
            data: payload,
          }
        : {
            method: apiRoutes.create.method,
            endpoint: apiRoutes.create.endpoint,
            data: payload,
          };

      dispatch(
        dynamic_request(
          requestConfig,
          editingField ? apiRoutes.update.identifier : apiRoutes.create.identifier
        ) as any
      );
    },
    [businessType, tenantId, organisationId, apiRoutes, dispatch]
  );

  // Delete field
  const handleDeleteField = useCallback(
    (fieldId: string) => {
      dispatch(
        dynamic_request(
          {
            method: apiRoutes.delete.method,
            endpoint: `${apiRoutes.delete.endpoint}/${fieldId}`,
            data: { _id: fieldId },
          },
          apiRoutes.delete.identifier
        ) as any
      );
    },
    [dispatch, apiRoutes.delete]
  );

  // Memoized fields data
  const fieldsData = useMemo(
    () => fieldsResponse?.result || [],
    [fieldsResponse?.result]
  );

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

