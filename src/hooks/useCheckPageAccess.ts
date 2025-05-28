import { retrieve_item } from "../helpers/functions";

export const useCheckPageAccess = (key: string) => {
  let has_access: boolean | null = null;
  let page_accesses = retrieve_item("page_accesses");

  try {
    let page_access = page_accesses.find((x: string) => x === key);

    if (page_access) {
      has_access = true;
    } else {
      has_access = false;
    }
  } catch (e) {
    has_access = false;
  }
  return has_access;
};
