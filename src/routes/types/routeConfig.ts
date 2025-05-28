// src/router/types.ts

import { ReactNode } from "react";

export interface RouteConfig {
  key: string;
  path: string;
  element?: ReactNode;
  children?: RouteConfig[];
}
export interface Album {
  _id: number;
  title: string;
  galleryname: string;
  gallerycover: string;
}
export interface EAlbum {
  _id: number;
  albumurl: string;
  albumname: string;
  albumcover: string;
  name: string;
  drive_folder_id: string;
  galleryname: string;
  album_cover: string;
}


