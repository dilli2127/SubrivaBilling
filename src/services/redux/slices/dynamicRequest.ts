import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiRequest } from "../../api/apiService";
import requestBackServer from "../../api";
import { API_ERROR_CODES } from "../../../helpers/constants";

interface DynamicRequestState {
    data: Record<string, any>;
    loading: boolean;
}

const initialState: DynamicRequestState = {
    data: {},
    loading: false,
};

const slice = createSlice({
    name: "dynamic_request",
    initialState,
    reducers: {
        _initiateDynamicRequest: (state, action: PayloadAction<{ key: string }>) => {
            const { key } = action.payload;
            state.data[key] = { loading: true, items: [], error: null };
        },
        _dynamicRequestResponse: (state, action: PayloadAction<{ key: string, data: any }>) => {
            const { key, data } = action.payload;
            state.data[key] = { loading: false, items: data, error: null };
        },
        _dynamicRequestFailure: (state, action: PayloadAction<{ key: string, error: any }>) => {
            const { key, error } = action.payload;
            state.data[key] = { loading: false, error };
        },
        _setState: (state, action: PayloadAction<{ key: string; value: any }>) => {
            const { key, value } = action.payload;
            state.data[key] = value;
        },
        _removeState: (state, action: PayloadAction<{ key: string }>) => {
            const { key } = action.payload;
            const data = { ...state.data };
            delete data[key];
            state.data = data;
        },
        _clearState: (state, action: PayloadAction<{ key: string }>) => {
            const { key } = action.payload;
            state.data[key] = null;
        },
    },
});

export const {
    _initiateDynamicRequest,
    _dynamicRequestResponse,
    _dynamicRequestFailure,
    _setState,
    _clearState,
    _removeState,
} = slice.actions;

export const dynamicRequestSelector = (state: any) => state.dynamic_request;
export const dynamicRequestReducer = slice.reducer;

export const _getDynamicRequest = (state: any) => state.dynamic_request?.data;

export const _dynamicRequestSelector = createSelector(
    [_getDynamicRequest, (_state, key) => key],
    (data, key) => data?.[key]
);

export function dynamic_request(variables: ApiRequest, key: any) {
    return async (dispatch: any) => {
        dispatch(_initiateDynamicRequest({ key }));
        try {
            const response = await requestBackServer(variables);
            if (response.statusCode !== API_ERROR_CODES.OK) {
                dispatch(_dynamicRequestFailure({ key, error: response }));
            } else {
                dispatch(_dynamicRequestResponse({ key, data: response.data || response}));
            }

        } catch (error: any) {
            dispatch(_dynamicRequestFailure({ key, error }));
        }
    };
}

export const dynamicSet = (pagination: { key: string; value: any }) => {
    return async (dispatch: any) => {
        dispatch(_setState(pagination));
    };
};

export function dynamic_clear(key: string) {
    return async (dispatch: any) => {
        dispatch(_clearState({ key }));
    };
}

export function dynamicRemove(key: any) {
    return async (dispatch: any) => {
        dispatch(_removeState({ key }));
    };
}
