import { useDispatch } from "react-redux";
import { handleApiResponse } from "./handleApiResponse";
import { Dispatch } from "redux";

// Custom hook to use handleApiResponse with dispatch automatically
export const useHandleApiResponse = () => {
  const dispatch: Dispatch<any> = useDispatch();
  return (params: Omit<Parameters<typeof handleApiResponse>[0], 'dispatch'> & { dispatch?: Dispatch<any> }) => {
    handleApiResponse({ ...params, dispatch: params.dispatch || dispatch });
  };
}; 