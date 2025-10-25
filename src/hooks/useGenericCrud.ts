import { useCallback, useEffect, useState } from 'react';
import { Form } from 'antd';
import { getEntityHooks } from '../services/redux/api/apiSlice';
import { CrudColumn, CrudFormItem } from '../components/common/GenericCrudPage';
import { showToast } from '../helpers/Common_functions';
import { BaseEntity } from '../types/entities';
import dayjs from 'dayjs';

export interface CrudConfig<T extends BaseEntity> {
  title: string;
  entityName: string; // Entity name for RTK Query (e.g., 'Product', 'Customer')
  columns: CrudColumn[];
  formItems: CrudFormItem[];
  formColumns?: number;
  drawerWidth?: number;
  canEdit?: (record: T) => boolean;
  canDelete?: (record: T) => boolean;
  dynamicFieldNames?: string[]; // Names of dynamic metadata fields
  metadataFieldName?: string; // Field name for storing metadata (default: 'meta_data_values', can be 'custom_data')
  skipMetadataWrapping?: boolean; // If true, send fields directly without any wrapping
}

export const useGenericCrud = <T extends BaseEntity>(config: CrudConfig<T>) => {
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<T>>({});
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Get RTK Query hooks for this entity
  const entityHooks = getEntityHooks(config.entityName);
  
  // Query parameters
  const queryParams = {
    page: pagination.current,
    limit: pagination.pageSize,
    ...filterValues,
  };

  // RTK Query hooks
  const {
    data: queryData,
    isLoading: loading,
    error: queryError,
    refetch: refetchQuery
  } = entityHooks.useGetQuery(queryParams);

  const [createMutation, { isLoading: createLoading, error: createError }] = entityHooks.useCreateMutation();
  const [updateMutation, { isLoading: updateLoading, error: updateError }] = entityHooks.useUpdateMutation();
  const [deleteMutation, { isLoading: deleteLoading, error: deleteError }] = entityHooks.useDeleteMutation();

  // Extract data from RTK Query response
  const items = queryData?.result || [];
  const paginationData = queryData?.pagination;

  console.log("RTK Query data:", queryData);
  console.log("items:", items);
  // CRUD operations using RTK Query
  const getAll = useCallback(() => {
    refetchQuery();
  }, [refetchQuery]);

  const create = useCallback(
    async (data: Partial<T>) => {
      try {
        const result = await createMutation(data).unwrap();
        showToast('success', `${config.title} created successfully`);
        refetchQuery();
        return result;
      } catch (error: any) {
        const errorMessage = error?.data?.message || `Failed to create ${config.title}`;
        showToast('error', errorMessage);
        throw error;
      }
    },
    [createMutation, config.title, refetchQuery]
  );

  const update = useCallback(
    async (id: string, data: Partial<T>) => {
      try {
        const result = await updateMutation({ id, data }).unwrap();
        showToast('success', `${config.title} updated successfully`);
        refetchQuery();
        return result;
      } catch (error: any) {
        const errorMessage = error?.data?.message || `Failed to update ${config.title}`;
        showToast('error', errorMessage);
        throw error;
      }
    },
    [updateMutation, config.title, refetchQuery]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        const result = await deleteMutation(id).unwrap();
        showToast('success', `${config.title} deleted successfully`);
        refetchQuery();
        return result;
      } catch (error: any) {
        const errorMessage = error?.data?.message || `Failed to delete ${config.title}`;
        showToast('error', errorMessage);
        throw error;
      }
    },
    [deleteMutation, config.title, refetchQuery]
  );

  const handlePaginationChange = useCallback((pageNumber: number, pageLimit: number) => {
    setPagination({ current: pageNumber, pageSize: pageLimit });
  }, []);

  function isStrictDate(value: string): boolean {
    // Only matches real ISO-like date formats (YYYY-MM-DD or with time)
    return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(
      value
    );
  }

  // Event handlers
  const handleEdit = useCallback((record: T) => {
    const newRecord: any = {};
    const metadataFieldName = config.metadataFieldName || 'meta_data_values';

    // Process main record fields
    for (const key in record) {
      if (!record.hasOwnProperty(key)) continue;
      
      const value = record[key];

      // Skip metadata field - we'll handle it separately
      if (key === metadataFieldName || key === 'meta_data_values' || key === 'custom_data') {
        continue;
      }

      if (
        typeof value === 'string' &&
        isStrictDate(value) &&
        dayjs(value, undefined, true).isValid()
      ) {
        newRecord[key] = dayjs(value);
      } else {
        newRecord[key] = value;
      }
    }

    // If metadata field exists, flatten it into the record
    const metaDataValues = (record as any)[metadataFieldName];
    if (metaDataValues && typeof metaDataValues === 'object') {
      for (const key in metaDataValues) {
        if (!metaDataValues.hasOwnProperty(key)) continue;
        
        const value = metaDataValues[key];
        
        // Skip if value is null or undefined
        if (value === null || value === undefined) {
          continue;
        }
        
        if (
          typeof value === 'string' &&
          isStrictDate(value) &&
          dayjs(value, undefined, true).isValid()
        ) {
          newRecord[key] = dayjs(value);
        } else {
          newRecord[key] = value;
        }
      }
    }

    setInitialValues(newRecord);
    setDrawerVisible(true);
  }, [config.metadataFieldName]);

  const handleDelete = useCallback(
    (record: T) => {
      remove(record._id);
    },
    [remove]
  );

  const handleDrawerOpen = useCallback(() => {
    setDrawerVisible(true);
  }, []);

  const resetForm = useCallback(() => {
    setDrawerVisible(false);
    setInitialValues({});
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(
    async (values: Partial<T>) => {
      let payload: any = { ...values };

      // Handle metadata wrapping based on configuration
      if (config.dynamicFieldNames && config.dynamicFieldNames.length > 0) {
        const staticFields: any = {};
        const metaDataValues: any = {};
        const metadataFieldName = config.metadataFieldName || 'meta_data_values';

        Object.keys(values).forEach((key) => {
          const value = (values as any)[key];
          
          if (config.dynamicFieldNames?.includes(key)) {
            // This is a dynamic metadata field
            // Only add non-undefined values
            if (value !== undefined) {
              metaDataValues[key] = value;
            }
          } else {
            // This is a static field
            staticFields[key] = value;
          }
        });

        // Wrap dynamic fields in metadata container
        if (Object.keys(metaDataValues).length > 0) {
          if (config.skipMetadataWrapping) {
            // For dynamic entities: send all dynamic fields directly in the metadata field
            payload = {
              ...staticFields,
              [metadataFieldName]: metaDataValues,
            };
          } else {
            // For normal CRUD: wrap in metadata field
            payload = {
              ...staticFields,
              [metadataFieldName]: metaDataValues,
            };
          }
        } else {
          payload = staticFields;
        }
      }

      try {
        if (initialValues._id) {
          await update(initialValues._id, payload);
        } else {
          await create(payload);
        }
        resetForm();
      } catch (error) {
        // Error handling is done in the mutation functions
        console.error('Submit error:', error);
      }
    },
    [initialValues._id, create, update, resetForm, config.dynamicFieldNames, config.metadataFieldName, config.skipMetadataWrapping]
  );

  // Load data on mount and when filters change
  useEffect(() => {
    getAll();
  }, [getAll]);

  return {
    // State
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    items,
    pagination: paginationData,
    drawerVisible,
    initialValues,
    form,
    filterValues,
    setFilterValues,

    // Actions
    handleEdit,
    handleDelete,
    handleDrawerOpen,
    resetForm,
    handleSubmit,
    handlePaginationChange,

    // Config
    ...config,
  };
};
