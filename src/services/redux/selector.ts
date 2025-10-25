import { useSelector as _useSelector } from "react-redux";
import { _dynamicRequestSelector } from './slices';
import { useMemo } from 'react';

export function useDynamicSelector(key: any) {
  const _data = _useSelector((state: any) => {
    return _dynamicRequestSelector(state, key);
  });
  
  // Memoize the return value to prevent new object creation
  return useMemo(() => {
    return _data || { loading: false, items: [], error: null };
  }, [_data]);
}