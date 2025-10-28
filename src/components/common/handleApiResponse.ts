import { showToast } from "../../helpers/Common_functions";

type ActionType = "create" | "update" | "delete";

interface ApiResponseHandlerParams {
  action: ActionType;
  success: boolean;
  title: string;
  getAllItems?: () => void;
  resetForm?: () => void;
  errorMessage?: string;
}

export const handleApiResponse = ({
  action,
  success,
  title,
  getAllItems,
  resetForm,
  errorMessage,
}: ApiResponseHandlerParams) => {
  if (success) {
    showToast("success", `${title} ${action}d successfully`);
    getAllItems?.();
    resetForm?.();
    // RTK Query handles cache invalidation automatically, no need for manual clearing
  } else {
    showToast("error", errorMessage || `Failed to ${action} ${title}`);
  }
};
