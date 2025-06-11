import Login from "../../pages/login/login";
import Signup from "../../pages/login/Signup";

export const API_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

export const API_ROUTES = {
  Signup: {
    Create: {
      identifier: "CreateSignup",
      method: API_METHODS.POST,
      endpoint: "signup",
    },
  },
  Login: {
    Create: {
      identifier: "CreateLogin",
      method: API_METHODS.POST,
      endpoint: "login",
    },
  },
  GetEivite: {
    Create: {
      identifier: "CreateEinvite",
      method: API_METHODS.PUT,
      endpoint: "e_invite",
    },
    Update: {
      identifier: "UpdateEinvite",
      method: API_METHODS.PATCH,
      endpoint: "e_invite/",
    },
    Get: {
      identifier: "GetEinvite",
      method: API_METHODS.GET,
      endpoint: "e_invite/",
    },
    Delete: {
      identifier: "DeleteEinvite",
      method: API_METHODS.DELETE,
      endpoint: "e_invite/",
    },
  },
  FileUploder: {
    Add: {
      identifier: "file-upload",
      method: API_METHODS.POST,
      endpoint: "/file-upload",
    },
    Update: {
      identifier: "UpdateLedgerDefinition",
      method: API_METHODS.POST,
      endpoint: "ledger-definition/update",
    },
    UpdateTemplate: {
      identifier: "UpdateTemplateLedgerDefinition",
      method: API_METHODS.POST,
      endpoint: "ledger-definition/mark-as-default",
    },
    Get: {
      identifier: "GetEinvite",
      method: API_METHODS.GET,
      endpoint: "e_invite/",
    },
    Delete: {
      identifier: "DeleteLedgerDefinition",
      method: API_METHODS.POST,
      endpoint: "ledger-definition/delete",
    },
  },
  CmsImage: {
    Create: {
      identifier: "AddCmsImage",
      method: API_METHODS.PUT,
      endpoint: "/cms_image",
    },
    Update: {
      identifier: "UpdateCmsImage",
      method: API_METHODS.PATCH,
      endpoint: "/cms_image",
    },
    Get: {
      identifier: "GetCmsImage",
      method: API_METHODS.GET,
      endpoint: "/cms_image",
    },
    GetAll: {
      identifier: "GetCmsImage",
      method: API_METHODS.POST,
      endpoint: "/cms_image",
    },
    GetAllGalleryImages: {
      identifier: "GetAllGalleryImages",
      method: API_METHODS.POST,
      endpoint: "/get_all_gallery_images",
    },
    Delete: {
      identifier: "DeleteCmsImage",
      method: API_METHODS.DELETE,
      endpoint: "/cms_image",
    },
  },

  Customer: {
    Create: {
      identifier: "AddCustomer",
      method: API_METHODS.PUT,
      endpoint: "/customer",
    },
    Update: {
      identifier: "UpdatCustomer",
      method: API_METHODS.PATCH,
      endpoint: "/customer",
    },
    Get: {
      identifier: "GetCustomer",
      method: API_METHODS.GET,
      endpoint: "/customer",
    },
    GetAll: {
      identifier: "GetAllCustomer",
      method: API_METHODS.POST,
      endpoint: "/customer",
    },
    Delete: {
      identifier: "DeleteCustomer",
      method: API_METHODS.DELETE,
      endpoint: "/customer",
    },
  },
};
