import React, { Suspense, lazy } from "react";
import { RouteConfig } from "./types/routeConfig";
import Sidebar from "../components/antd/sidebar/sidebar";
import { Outlet } from "react-router-dom";
import AppHeader from "../components/Header/Header";
import LandingBanner from "../pages/Home";
import Login from "../pages/login/login";
import Signup from "../pages/login/Signup";

const Loader = () => <div>Loading...</div>;

const routerData: RouteConfig[] = [
  {
    key: "login",
    path: "/login",
    element: (
      <Suspense fallback={<Loader />}>
        <Login />
      </Suspense>
    ),
    children: [],
  },
  {
    key: "admin",
    path: "/admin",
    element: (
      <Suspense fallback={<Loader />}>
        <Login />
      </Suspense>
    ),
    children: [],
  },
  {
    key: "signup",
    path: "/signup",
    element: (
      <Suspense fallback={<Loader />}>
        <Signup />
      </Suspense>
    ),
    children: [],
  },
  // user web
  {
    key: "userweb",
    path: "/",
    element: (
      <Suspense fallback={<Loader />}>
        <AppHeader />
        <Outlet />
      </Suspense>
    ),
    children: [
      {
        key: "landingPage",
        path: "/",
        element: (
          <Suspense fallback={<Loader />}>
            <LandingBanner />
          </Suspense>
        ),
      },
    ],
  },

  // Admin Routes
  {
    key: "admin",
    path: "admin",
    element: (
      <Suspense fallback={<Loader />}>
        <Sidebar>
          <Outlet />
        </Sidebar>
      </Suspense>
    ),
    children: [],
  },
];

export default routerData;
