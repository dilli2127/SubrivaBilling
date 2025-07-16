import { showToast } from "../../helpers/Common_functions";
import { dynamic_clear } from "../../services/redux";

type ActionType = "create" | "update" | "delete";

interface ApiResponseHandlerParams {
  action: ActionType;
  success: boolean;
  title: string;
  getAllItems?: () => void;
  resetForm?: () => void;
  dispatch?: (arg: any) => void;
  identifier?: string;
  shouldClear?: boolean;
  errorMessage?: string;
}

export const handleApiResponse = ({
  action,
  success,
  title,
  getAllItems,
  resetForm,
  dispatch,
  identifier,
  shouldClear = true,
  errorMessage,
}: ApiResponseHandlerParams) => {
  if (success) {
    showToast("success", `${title} ${action}d successfully`);
    getAllItems?.();
    resetForm?.();
    if (shouldClear && dispatch && identifier) {
      dispatch(dynamic_clear(identifier));
    }
  } else {
    showToast("error", errorMessage || `Failed to ${action} ${title}`);
  }
};
