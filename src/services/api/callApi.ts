import { ApiRequest } from "./apiService";
import { ThunkDispatch } from "redux-thunk";
import { dynamic_request } from "../redux"; // 🔄 Update this path if needed

export const callApi = (
  dispatch: ThunkDispatch<any, any, any>,
  request: ApiRequest,
  identifier: string
) => {
  return dispatch(dynamic_request(request, identifier));
};
