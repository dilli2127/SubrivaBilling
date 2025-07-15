import { useDispatch } from 'react-redux';
import { useDynamicSelector, dynamic_clear } from '../../services/redux';
import { handleApiResponse } from './handleApiResponse';
import type { Dispatch } from 'redux';
import { useEffect } from 'react';

export const useHandleApiResponse = ({
  action,
  title,
  identifier,
  entityApi,
  dispatch: customDispatch,
}: {
  action: 'create' | 'update' | 'delete';
  title: string;
  identifier: string;
  entityApi?: any;
  dispatch?: Dispatch<any>;
}) => {
  const reduxDispatch = useDispatch();
  const { items: result, error, loading } = useDynamicSelector(identifier);
  const resolvedDispatch = customDispatch || reduxDispatch;

  useEffect(() => {
    if (!loading && (result || error)) {
      const success = !!(result && result.statusCode === 200);

      handleApiResponse({
        action,
        title,
        identifier,
        success,
        dispatch: resolvedDispatch,
        shouldClear: false,
      });

      // Automatically call GetAll after success
      if (success && entityApi) {
        entityApi('GetAll');
      }

      resolvedDispatch(dynamic_clear(identifier) as any);
    }
  }, [
    loading,
    result,
    error,
    resolvedDispatch,
    action,
    title,
    identifier,
    entityApi,
  ]);
};
