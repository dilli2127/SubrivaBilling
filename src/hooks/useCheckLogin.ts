import { retrieve_item } from "../helpers/functions";

export const useCheckLogin = () => {
  let is_logged_in: boolean | null = null;
  let session_id = retrieve_item("session_id");
  try {
    if (session_id) {
      is_logged_in = true;
    } else {
      is_logged_in = false;
    }
  } catch (e) {
    is_logged_in = false;
  }
  return is_logged_in;
};
