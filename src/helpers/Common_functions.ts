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
export const getApiRouteVariant = (action: keyof typeof API_ROUTES.Variant) => {
  const route = API_ROUTES?.Variant?.[action];
  if (!route) {
    console.error(`API_ROUTES.Variant.${action} is undefined.`);
    throw new Error(`API route for Variant.${action} is not defined.`);
  }
  return route;
};

export const getApiRouteCategory = (action: keyof typeof API_ROUTES.Category) => {
  const route = API_ROUTES?.Category?.[action];
  if (!route) {
    console.error(`API_ROUTES.Category.${action} is undefined.`);
    throw new Error(`API route for Category.${action} is not defined.`);
  }
  return route;
};

export const getApiRouteProduct = (action: keyof typeof API_ROUTES.Product) => {
  const route = API_ROUTES?.Product?.[action];
  if (!route) {
    console.error(`API_ROUTES.Product.${action} is undefined.`);
    throw new Error(`API route for Product.${action} is not defined.`);
  }
  return route;
};

export const getApiRouteVendor = (action: keyof typeof API_ROUTES.Vendor) => {
  const route = API_ROUTES?.Vendor?.[action];
  if (!route) {
    console.error(`API_ROUTES.Vendor.${action} is undefined.`);
    throw new Error(`API route for Vendor.${action} is not defined.`);
  }
  return route;
};

export const getApiRouteWareHouse = (action: keyof typeof API_ROUTES.Warehouse) => {
  const route = API_ROUTES?.Warehouse?.[action];
  if (!route) {
    console.error(`API_ROUTES.Warehouse.${action} is undefined.`);
    throw new Error(`API route for Warehouse.${action} is not defined.`);
  }
  return route;
};