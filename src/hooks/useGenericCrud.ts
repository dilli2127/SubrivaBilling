import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Form } from 'antd';
import {
  dynamic_request,
  useDynamicSelector,
  dynamic_clear,
} from '../services/redux';
import { CrudColumn, CrudFormItem } from '../components/common/GenericCrudPage';
import { showToast } from '../helpers/Common_functions';
import { BaseEntity } from '../types/entities';
import { Dispatch } from 'redux';
import dayjs from 'dayjs';

export interface CrudConfig<T extends BaseEntity> {
  title: string;
  columns: CrudColumn[];
  formItems: CrudFormItem[];
  apiRoutes: {
    get: { method: string; endpoint: string; identifier: string };
    create: { method: string; endpoint: string; identifier: string };
    update: { method: string; endpoint: string; identifier: string };
    delete: { method: string; endpoint: string; identifier: string };
  };
  formColumns?: number;
  drawerWidth?: number;
  canEdit?: (record: T) => boolean;
  canDelete?: (record: T) => boolean;
  dynamicFieldNames?: string[]; // Names of dynamic metadata fields
}

export const useGenericCrud = <T extends BaseEntity>(config: CrudConfig<T>) => {
  const dispatch: Dispatch<any> = useDispatch();
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<T>>({});
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Selectors
  const { loading, items } = useDynamicSelector(
    config.apiRoutes.get.identifier
  );
  const { loading: createLoading, items: createItems, error: createError } = useDynamicSelector(
    config.apiRoutes.create.identifier
  );
  const { loading: updateLoading, items: updateItems, error: updateError } = useDynamicSelector(
    config.apiRoutes.update.identifier
  );
  const { loading: deleteLoading, items: deleteItems, error: deleteError } = useDynamicSelector(
    config.apiRoutes.delete.identifier
  );

  // API call function
  const callApi = useCallback(
    (method: string, endpoint: string, data: any, identifier: string) => {
      dispatch(dynamic_request({ method, endpoint, data }, identifier) as any);
    },
    [dispatch]
  );

  // CRUD operations
  const getAll = useCallback(() => {
    const apiData = {
      ...filterValues,
      pageNumber: pagination.current,
      pageLimit: pagination.pageSize,
    };
    callApi(
      config.apiRoutes.get.method,
      config.apiRoutes.get.endpoint,
      apiData,
      config.apiRoutes.get.identifier
    );
  }, [callApi, config.apiRoutes.get, filterValues, pagination]);

  const create = useCallback(
    (data: Partial<T>) => {
      callApi(
        config.apiRoutes.create.method,
        config.apiRoutes.create.endpoint,
        data,
        config.apiRoutes.create.identifier
      );
    },
    [callApi, config.apiRoutes.create]
  );

  const update = useCallback(
    (id: string, data: Partial<T>) => {
      callApi(
        config.apiRoutes.update.method,
        `${config.apiRoutes.update.endpoint}/${id}`,
        data,
        config.apiRoutes.update.identifier
      );
    },
    [callApi, config.apiRoutes.update]
  );

  const remove = useCallback(
    (id: string) => {
      callApi(
        config.apiRoutes.delete.method,
        `${config.apiRoutes.delete.endpoint}/${id}`,
        { _id: id },
        config.apiRoutes.delete.identifier
      );
    },
    [callApi, config.apiRoutes.delete]
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

    // Process main record fields
    for (const key in record) {
      if (!record.hasOwnProperty(key)) continue;
      
      const value = record[key];

      // Skip meta_data_values - we'll handle it separately
      if (key === 'meta_data_values') {
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

    // If meta_data_values exists, flatten it into the record
    const metaDataValues = (record as any).meta_data_values;
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
  }, []);

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
    (values: Partial<T>) => {
      let payload: any = { ...values };

      // If dynamic field names are provided, separate them into meta_data_values
      if (config.dynamicFieldNames && config.dynamicFieldNames.length > 0) {
        const staticFields: any = {};
        const metaDataValues: any = {};

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

        // Only add meta_data_values if it has content
        if (Object.keys(metaDataValues).length > 0) {
          payload = {
            ...staticFields,
            meta_data_values: metaDataValues,
          };
        } else {
          payload = staticFields;
        }
      }

      if (initialValues._id) {
        update(initialValues._id, payload);
      } else {
        create(payload);
      }
    },
    [initialValues._id, create, update, config.dynamicFieldNames]
  );

  // No local filtering; all filtering is server-side
  // API response handlers
  useEffect(() => {
    if (createItems?.statusCode === 200) {
      showToast('success', `${config.title} created successfully`);
      getAll();
      resetForm();
      dispatch(dynamic_clear(config.apiRoutes.create.identifier));
    } else if (createError) {
      const errorMessage =
        createError.message || `Failed to create ${config.title}`;
      showToast('error', errorMessage);
    }
  }, [
    createItems,
    createError,
    config.title,
    getAll,
    resetForm,
    dispatch,
    config.apiRoutes.create.identifier,
  ]);

  useEffect(() => {
    if (updateItems?.statusCode === 200) {
      showToast('success', `${config.title} updated successfully`);
      getAll();
      resetForm();
      dispatch(dynamic_clear(config.apiRoutes.update.identifier));
    } else if (updateError) {
      const errorMessage =
        updateError.message || `Failed to update ${config.title}`;
      showToast('error', errorMessage);
    }
  }, [
    updateItems,
    updateError,
    config.title,
    getAll,
    resetForm,
    dispatch,
    config.apiRoutes.update.identifier,
  ]);

  useEffect(() => {
    if (deleteItems?.statusCode === 200) {
      showToast('success', `${config.title} deleted successfully`);
      getAll();
      dispatch(dynamic_clear(config.apiRoutes.delete.identifier));
    } else if (deleteError) {
      const errorMessage =
        deleteError.message || `Failed to delete ${config.title}`;
      showToast('error', errorMessage);
    }
  }, [
    deleteItems,
    deleteError,
    config.title,
    getAll,
    dispatch,
    config.apiRoutes.delete.identifier,
  ]);

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
    items: items?.result,
    pagination: items?.pagination,
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
