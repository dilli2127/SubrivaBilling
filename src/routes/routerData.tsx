import React, { Suspense, lazy } from "react";
import { RouteConfig } from "./types/routeConfig";
import Sidebar from "../components/antd/sidebar/sidebar";
import { Outlet } from "react-router-dom";
import AppHeader from "../components/Header/Header";
import LandingBanner from "../pages/Home";
import Login from "../pages/login/login";
import Signup from "../pages/login/Signup";
import Dashboard from "../pages/Dashboard";
const ProductCrud = lazy(() => import("../pages/Products/crud"));
const UnitCrud = lazy(() => import("../pages/Unit/crud"));
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
  // {
  //   key: "userweb",
  //   path: "/",
  //   element: (
  //     <Suspense fallback={<Loader />}>
  //       <AppHeader />
  //       <Outlet />
  //     </Suspense>
  //   ),
  //   children: [
  //     {
  //       key: "landingPage",
  //       path: "/",
  //       element: (
  //         <Suspense fallback={<Loader />}>
  //           <LandingBanner />
  //         </Suspense>
  //       ),
  //     },
  //   ],
  // },

  // Admin Routes
  {
    key: "admin",
    path: "/",
    element: (
      <Suspense fallback={<Loader />}>
        <Sidebar>
          <Outlet />
        </Sidebar>
      </Suspense>
    ),
    children: [
      {
        key: "dashboard",
        path: "dashboard",
        element: (
          <Suspense fallback={<Loader />}>
            <Dashboard />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "prduct_crud",
        path: "prduct_crud",
        element: (
          <Suspense fallback={<Loader />}>
            <ProductCrud />
          </Suspense>
        ),
        children: [],
      },
      {
        key: "unit_crud",
        path: "unit_crud",
        element: (
          <Suspense fallback={<Loader />}>
            <UnitCrud />
          </Suspense>
        ),
        children: [],
      },
    ],
  },
];

export default routerData;
