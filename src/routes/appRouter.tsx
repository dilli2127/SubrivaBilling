// src/router/AppRouter.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routerData from './routerData';
import { RouteConfig } from './types/routeConfig';
import NotFound from '../pages/notFound';

const renderRoutes = (routes: RouteConfig[]) =>
{
  return routes.map(({ path, element, children }, index) => (
    <Route key={index} path={path} element={element}>
      {children && children.length > 0 && renderRoutes(children)}
    </Route>
  ));
};

const AppRouter: React.FC = () =>
{
  return (
    <Router>
      <Routes>
        {renderRoutes(routerData)}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
