import type { ThunkDispatch } from "@reduxjs/toolkit";
import { dynamic_request } from "../redux"; // 🔄 Update this path if needed
import type { ApiRequest } from "./apiService";

export const callApi = (
  dispatch: ThunkDispatch<any, any, any>,
  request: ApiRequest,
  identifier: string
) => {
  return dispatch(dynamic_request(request, identifier));
};
