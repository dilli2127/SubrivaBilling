import { useDispatch } from "react-redux";
import { useDynamicSelector, dynamic_clear } from "../../services/redux";
import { handleApiResponse } from "./handleApiResponse";
import { Dispatch } from "redux";
import { useEffect } from "react";

export const useHandleApiResponse = ({
  action,
  title,
  identifier,
  dispatch: customDispatch,
}: {
  action: "create" | "update" | "delete";
  title: string;
  identifier: string;
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
      });

      resolvedDispatch(dynamic_clear(identifier));
    }
  }, [
    loading,
    result,
    error,
    resolvedDispatch,
    action,
    title,
    identifier,
  ]);
};
