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
}

export const handleApiResponse = ({
  action,
  success,
  title,
  getAllItems,
  resetForm,
  dispatch,
  identifier,
}: ApiResponseHandlerParams) => {
  if (success) {
    showToast("success", `${title} ${action}d successfully`);
    getAllItems?.();
    resetForm?.();
    if (dispatch && identifier) {
      dispatch(dynamic_clear(identifier));
    }
  } else {
    showToast("error", `Failed to ${action} ${title}`);
  }
};
