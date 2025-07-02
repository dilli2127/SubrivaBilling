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
}

export const useGenericCrud = <T extends BaseEntity>(config: CrudConfig<T>) => {
  const dispatch: Dispatch<any> = useDispatch();
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<T>>({});
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  // Selectors
  const { loading, items } = useDynamicSelector(
    config.apiRoutes.get.identifier
  );
  const { items: createItems, error: createError } = useDynamicSelector(
    config.apiRoutes.create.identifier
  );
  const { items: updateItems, error: updateError } = useDynamicSelector(
    config.apiRoutes.update.identifier
  );
  const { items: deleteItems, error: deleteError } = useDynamicSelector(
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
    callApi(
      config.apiRoutes.get.method,
      config.apiRoutes.get.endpoint,
      filterValues,
      config.apiRoutes.get.identifier
    );
  }, [callApi, config.apiRoutes.get, filterValues]);

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
  function isStrictDate(value: string): boolean {
    // Only matches real ISO-like date formats (YYYY-MM-DD or with time)
    return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(
      value
    );
  }
  // Event handlers
  const handleEdit = useCallback((record: T) => {
    const newRecord: any = {};

    for (const key in record) {
      const value = record[key];

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
      if (initialValues._id) {
        update(initialValues._id, values);
      } else {
        create(values);
      }
    },
    [initialValues._id, create, update]
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
    items: items?.result,
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

    // Config
    ...config,
  };
};
