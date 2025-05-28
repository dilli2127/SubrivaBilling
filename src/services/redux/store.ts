import { configureStore} from '@reduxjs/toolkit';
import { rootReducers } from './reducer';

export const store = configureStore({reducer: rootReducers})