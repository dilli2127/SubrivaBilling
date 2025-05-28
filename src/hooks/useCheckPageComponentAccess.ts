import { retrieve_item } from "../helpers/functions";

export const useCheckPageComponentAccess = (key: string) => {
  let has_access: boolean | null = null;
  let page_component_accesses = retrieve_item("page_component_accesses");
  try {
    let page_component_access = page_component_accesses.find(
      (x: string) => x === key
    );

    if (page_component_access) {
      has_access = true;
    } else {
      has_access = false;
    }
  } catch (e) {
    has_access = false;
  }
  return has_access;
};
