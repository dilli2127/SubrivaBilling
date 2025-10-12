/**
 * DYNAMIC ENTITY SYSTEM - ROUTE CONFIGURATION EXAMPLE
 * 
 * Add these routes to your routerData.tsx file
 */

import { lazy } from 'react';

export const dynamicEntityRoutes = [
  // 1. Entity Definitions Management (SuperAdmin Only)
  {
    path: '/entity-definitions',
    name: 'Entity Definitions',
    component: lazy(() => import('../EntityDefinitions/crud')),
    exact: true,
    roles: ['superadmin'],
    icon: 'AppstoreAddOutlined',
    description: 'Manage custom entity definitions',
  },

  // 2. Entity Explorer - Browse all custom entities
  {
    path: '/entities',
    name: 'Custom Entities',
    component: lazy(() => import('./EntityExplorer')),
    exact: true,
    roles: ['superadmin', 'tenant', 'branch', 'user'],
    icon: 'AppstoreOutlined',
    description: 'Browse and access custom entities',
  },

  // 3. Dynamic Entity CRUD - Auto-generated pages
  {
    path: '/dynamic-entity/:entityName',
    name: 'Dynamic Entity',
    component: lazy(() => import('./DynamicEntityCrud')),
    exact: true,
    roles: ['superadmin', 'tenant', 'branch', 'user'],
    hideInMenu: true, // Don't show in sidebar, accessed from Entity Explorer
    description: 'Dynamic CRUD page for custom entities',
  },
];

/**
 * EXAMPLE: Full routerData.tsx integration
 * 
 * import { dynamicEntityRoutes } from './DynamicEntity/ROUTES_EXAMPLE';
 * 
 * export const routes = [
 *   ...existingRoutes,
 *   ...dynamicEntityRoutes,
 * ];
 */

/**
 * EXAMPLE: Adding to sidebar menu
 * 
 * In your sidebar configuration:
 * 
 * {
 *   key: 'entities',
 *   label: 'Custom Entities',
 *   icon: <AppstoreOutlined />,
 *   path: '/entities',
 *   roles: ['superadmin', 'tenant', 'branch', 'user'],
 * },
 * {
 *   key: 'entity-definitions',
 *   label: 'Entity Definitions',
 *   icon: <AppstoreAddOutlined />,
 *   path: '/entity-definitions',
 *   roles: ['superadmin'], // SuperAdmin only
 * },
 */

/**
 * BACKEND API ROUTES REQUIRED
 * 
 * EntityDefinition Routes:
 * - PUT    /entity_definitions           (Create)
 * - POST   /entity_definitions           (List with pagination)
 * - GET    /entity_definitions           (List without pagination)
 * - GET    /entity_definitions/:_id      (Get one)
 * - POST   /entity_definitions/:_id      (Update)
 * - DELETE /entity_definitions/:_id      (Delete)
 * 
 * DynamicEntity Routes (entity_name = leads, deals, tickets, etc.):
 * - PUT    /:entity_name                 (Create record)
 * - POST   /:entity_name                 (List records with pagination)
 * - GET    /:entity_name                 (List records without pagination)
 * - GET    /:entity_name/:_id            (Get one record)
 * - POST   /:entity_name/:_id            (Update record)
 * - DELETE /:entity_name/:_id            (Delete record)
 * 
 * Note: The entity_name in the URL should match the entity_name 
 * defined in the EntityDefinition (e.g., /leads, /deals, /tickets)
 * 
 * See README.md for full backend implementation examples.
 */

