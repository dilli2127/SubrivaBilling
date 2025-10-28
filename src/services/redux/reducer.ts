import { combineReducers } from 'redux';

// All reducers are now managed by RTK Query's apiSlice
// The old dynamic_request reducer has been removed as it's no longer used
export const rootReducersMap = {};

export const rootReducers = combineReducers(rootReducersMap);

