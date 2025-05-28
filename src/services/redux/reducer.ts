import {combineReducers} from 'redux';
import { dynamicRequestReducer } from './slices';
export const rootReducers = 
    combineReducers({
        dynamic_request: dynamicRequestReducer
    })

