import { combineReducers } from 'redux';
import { dynamicRequestReducer } from './slices/dynamicRequest';

// Export reducers map - keeping dynamicRequest for backward compatibility during migration
export const rootReducersMap = {
  dynamic_request: dynamicRequestReducer,
};

export const rootReducers = combineReducers(rootReducersMap);

