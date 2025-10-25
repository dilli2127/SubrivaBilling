import { useCallback, useEffect, useState, useMemo } from 'react';
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

export interface CrudReturn<T extends BaseEntity> {
  // State
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  items: T[];
  pagination?: {
    current: number;
    pageSize: number;
    total?: number;
  };
  drawerVisible: boolean;
  initialValues: Partial<T>;
  form: ReturnType<typeof Form.useForm>[0];
  filterValues: Record<string, unknown>;
  setFilterValues: (values: Record<string, unknown>) => void;

  // Actions
  handleEdit: (record: T) => void;
  handleDelete: (record: T) => void;
  handleDrawerOpen: () => void;
  resetForm: () => void;
  handleSubmit: (values: Partial<T>) => Promise<void>;
  handlePaginationChange: (pageNumber: number, pageLimit: number) => void;

  // Config
  title: string;
  entityName: string;
  columns: CrudColumn[];
  formItems: CrudFormItem[];
  formColumns?: number;
  drawerWidth?: number;
  canEdit?: (record: T) => boolean;
  canDelete?: (record: T) => boolean;
  dynamicFieldNames?: string[];
  metadataFieldName?: string;
  skipMetadataWrapping?: boolean;
}

export const useGenericCrud = <T extends BaseEntity>(config: CrudConfig<T>): CrudReturn<T> => {
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<T>>({});
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Get RTK Query hooks for this entity
  const entityHooks = getEntityHooks(config.entityName);
  
  // Memoize query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({
    page: pagination.current,
    limit: pagination.pageSize,
    ...filterValues,
  }), [pagination.current, pagination.pageSize, filterValues]);

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

  // Memoize data extraction to prevent unnecessary re-renders
  const items = useMemo(() => queryData?.result || [], [queryData?.result]);
  const paginationData = useMemo(() => queryData?.pagination, [queryData?.pagination]);
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
      } catch (error: unknown) {
        const errorMessage = 
          (error as { data?: { message?: string } })?.data?.message || 
          `Failed to create ${config.title}`;
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
      } catch (error: unknown) {
        const errorMessage = 
          (error as { data?: { message?: string } })?.data?.message || 
          `Failed to update ${config.title}`;
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
      } catch (error: unknown) {
        const errorMessage = 
          (error as { data?: { message?: string } })?.data?.message || 
          `Failed to delete ${config.title}`;
        showToast('error', errorMessage);
        throw error;
      }
    },
    [deleteMutation, config.title, refetchQuery]
  );

  const handlePaginationChange = useCallback((pageNumber: number, pageLimit: number) => {
    setPagination({ current: pageNumber, pageSize: pageLimit });
  }, []);

  // Memoize date validation regex to prevent recreation
  const dateRegex = useMemo(() => 
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/,
    []
  );

  const isStrictDate = useCallback((value: string): boolean => {
    return dateRegex.test(value);
  }, [dateRegex]);

  // Optimized date parsing function
  const parseDateValue = useCallback((value: unknown): unknown => {
    if (typeof value === 'string' && isStrictDate(value)) {
      const parsedDate = dayjs(value, undefined, true);
      return parsedDate.isValid() ? parsedDate : value;
    }
    return value;
  }, [isStrictDate]);

  // Event handlers
  const handleEdit = useCallback((record: T) => {
    const newRecord: Record<string, unknown> = {};
    const metadataFieldName = config.metadataFieldName || 'meta_data_values';

    // Process main record fields
    Object.entries(record).forEach(([key, value]) => {
      // Skip metadata field - we'll handle it separately
      if (key === metadataFieldName || key === 'meta_data_values' || key === 'custom_data') {
        return;
      }

      newRecord[key] = parseDateValue(value);
    });

    // If metadata field exists, flatten it into the record
    const metaDataValues = (record as Record<string, unknown>)[metadataFieldName];
    if (metaDataValues && typeof metaDataValues === 'object' && metaDataValues !== null) {
      Object.entries(metaDataValues).forEach(([key, value]) => {
        // Skip if value is null or undefined
        if (value === null || value === undefined) {
          return;
        }
        
        newRecord[key] = parseDateValue(value);
      });
    }

    setInitialValues(newRecord as Partial<T>);
    setDrawerVisible(true);
  }, [config.metadataFieldName, parseDateValue]);

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

  // Optimized payload processing function
  const processPayload = useCallback((values: Partial<T>): Record<string, unknown> => {
    if (!config.dynamicFieldNames || config.dynamicFieldNames.length === 0) {
      return values as Record<string, unknown>;
    }

    const staticFields: Record<string, unknown> = {};
    const metaDataValues: Record<string, unknown> = {};
    const metadataFieldName = config.metadataFieldName || 'meta_data_values';

    Object.entries(values).forEach(([key, value]) => {
      if (config.dynamicFieldNames?.includes(key)) {
        // This is a dynamic metadata field
        if (value !== undefined) {
          metaDataValues[key] = value;
        }
      } else {
        // This is a static field
        staticFields[key] = value;
      }
    });

    // Return payload based on configuration
    if (Object.keys(metaDataValues).length > 0) {
      return {
        ...staticFields,
        [metadataFieldName]: metaDataValues,
      };
    }
    
    return staticFields;
  }, [config.dynamicFieldNames, config.metadataFieldName]);

  const handleSubmit = useCallback(
    async (values: Partial<T>) => {
      const payload = processPayload(values);

      try {
        if (initialValues._id) {
          await update(initialValues._id, payload as Partial<T>);
        } else {
          await create(payload as Partial<T>);
        }
        resetForm();
      } catch (error) {
        // Error handling is done in the mutation functions
        console.error('Submit error:', error);
      }
    },
    [initialValues._id, create, update, resetForm, processPayload]
  );

  // Trigger initial data load on mount
  useEffect(() => {
    getAll();
  }, []); // Empty dependency array - only run on mount

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
