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
  GalleryCategory: {
    Create: {
      identifier: "AddGalleryCategory",
      method: API_METHODS.PUT,
      endpoint: "/gallery_category",
    },
    Update: {
      identifier: "UpdatGalleryCategory",
      method: API_METHODS.PATCH,
      endpoint: "/gallery_category",
    },
    Get: {
      identifier: "GetGalleryCategory",
      method: API_METHODS.GET,
      endpoint: "/gallery_category",
    },
    GetAll: {
      identifier: "GetGalleryCategory",
      method: API_METHODS.POST,
      endpoint: "/gallery_category",
    },
    Delete: {
      identifier: "DeleteGalleryCategory",
      method: API_METHODS.DELETE,
      endpoint: "/gallery_category",
    },
  },
  Gallery: {
    Create: {
      identifier: "AddGallery",
      method: API_METHODS.PUT,
      endpoint: "/gallery",
    },
    Update: {
      identifier: "UpdatGallery",
      method: API_METHODS.PATCH,
      endpoint: "/gallery",
    },
    Get: {
      identifier: "GetGallery",
      method: API_METHODS.GET,
      endpoint: "/gallery",
    },
    GetAll: {
      identifier: "GetGallery",
      method: API_METHODS.POST,
      endpoint: "/gallery",
    },
    Delete: {
      identifier: "DeleteGallery",
      method: API_METHODS.DELETE,
      endpoint: "/gallery",
    },
  },
  EGallery: {
    Create: {
      identifier: "AddEGallery",
      method: API_METHODS.PUT,
      endpoint: "/e_gallery",
    },
    Update: {
      identifier: "UpdatEGallery",
      method: API_METHODS.PATCH,
      endpoint: "/e_gallery",
    },
    Get: {
      identifier: "GetEGallery",
      method: API_METHODS.GET,
      endpoint: "/e_gallery",
    },
    GetAll: {
      identifier: "GetEGallery",
      method: API_METHODS.POST,
      endpoint: "/e_gallery",
    },
    Delete: {
      identifier: "DeleteEGallery",
      method: API_METHODS.DELETE,
      endpoint: "/e_gallery",
    },
  },
  User: {
    Create: {
      identifier: "AddUser",
      method: API_METHODS.PUT,
      endpoint: "/user",
    },
    Update: {
      identifier: "UpdatUser",
      method: API_METHODS.PATCH,
      endpoint: "/user",
    },
    Get: {
      identifier: "GetEUser",
      method: API_METHODS.GET,
      endpoint: "/user",
    },
    GetAll: {
      identifier: "GetAllUser",
      method: API_METHODS.POST,
      endpoint: "/user",
    },
    Delete: {
      identifier: "DeleteUser",
      method: API_METHODS.DELETE,
      endpoint: "/user",
    },
  },
  EAlbum: {
    Create: {
      identifier: "AddEAlbum",
      method: API_METHODS.PUT,
      endpoint: "/e_album",
    },
    Update: {
      identifier: "UpdatEAlbum",
      method: API_METHODS.PATCH,
      endpoint: "/e_album",
    },
    Get: {
      identifier: "GetEAlbum",
      method: API_METHODS.GET,
      endpoint: "/e_album",
    },
    GetAll: {
      identifier: "GetEAlbum",
      method: API_METHODS.POST,
      endpoint: "/e_album",
    },
    Delete: {
      identifier: "DeleteEAlbum",
      method: API_METHODS.DELETE,
      endpoint: "/e_album",
    },
  },
};
