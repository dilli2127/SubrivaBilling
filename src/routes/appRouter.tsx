// src/router/AppRouter.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routerData from './routerData';
import NotFound from '../pages/notFound';
import GlobalShortcutsProvider from '../helpers/GlobalShortcutsProvider';
import React, { Suspense } from "react";
import Loader from "../components/common/Loader";
import type { RouteConfig } from './types/routeConfig';

const renderRoutes = (routes: RouteConfig[]) => {
  return routes.map(({ path, element, children }, index) => (
    <Route
      key={index}
      path={path}
      element={<Suspense fallback={<Loader />}>{element}</Suspense>}
    >
      {children && children.length > 0 ? renderRoutes(children) : null}
    </Route>
  ));
};



const AppRouter: React.FC = () => {
  return (
    <Router>
      <GlobalShortcutsProvider />
      <Routes>
        {renderRoutes(routerData)}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
