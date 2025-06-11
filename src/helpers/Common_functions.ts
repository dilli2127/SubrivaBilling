import { message } from "antd";
import { API_ROUTES } from "../services/api/utils";

export const showToast = (type: "success" | "error", content: string) => {
  if (type === "success") {
    message.success(content);
  } else if (type === "error") {
    message.error(content);
  }
};

export const getApiRouteCmsImage = (action: keyof typeof API_ROUTES.CmsImage) => {
  const route = API_ROUTES?.CmsImage?.[action];
  if (!route) {
    console.error(`API_ROUTES.CmsImage.${action} is undefined.`);
    throw new Error(`API route for CmsImage.${action} is not defined.`);
  }
  return route;
};

export const getApiRouteCustomer = (action: keyof typeof API_ROUTES.Customer) => {
  const route = API_ROUTES?.Customer?.[action];
  if (!route) {
    console.error(`API_ROUTES.Customer.${action} is undefined.`);
    throw new Error(`API route for Customer.${action} is not defined.`);
  }
  return route;
};

export const getApiRouteUnit = (action: keyof typeof API_ROUTES.Unit) => {
  const route = API_ROUTES?.Unit?.[action];
  if (!route) {
    console.error(`API_ROUTES.Unit.${action} is undefined.`);
    throw new Error(`API route for Unit.${action} is not defined.`);
  }
  return route;
};