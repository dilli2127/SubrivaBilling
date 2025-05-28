import { AppstoreOutlined, UserOutlined } from "@ant-design/icons";

export const menuItems = [
  {
    key: "EInviteCrud",
    icon: <UserOutlined />,
    label: "E-Invite",
    path: "einvite_crud",
  },
  {
    key: "EMemories", 
    icon: <AppstoreOutlined />,
    label: "E-Memories",
    children: [ 
      {
        key: "EAlbumCrud",
        icon: <UserOutlined />,
        label: "E-Album",
        path: "ealbum_crud",
      },
      {
        key: "EGalleryCrud",
        icon: <UserOutlined />,
        label: "E-Gallery",
        path: "egallery_crud",
      },
    ],
  },
  {
    key: "Gallery Crud",
    icon: <UserOutlined />,
    label: "Gallery",
    path: "gallery_crud",
  },
 
  {
    key: "MasterData",
    icon: <UserOutlined />, 
    label: "Master Data",
    children: [ 
      {
        key: "GalaryCategory",
        icon: <UserOutlined />,
        label: "Galary Category",
        path: "gallary_category_Crud",
      },
      {
        key: "CMS Images Crud",
        icon: <UserOutlined />,
        label: "CMS Images",
        path: "image_crud",
      },
      {
        key: "GalleryImages",
        icon: <UserOutlined />,
        label: "Gallery Images",
        path: "gallery_image_crud",
      },
    ],
  },
];