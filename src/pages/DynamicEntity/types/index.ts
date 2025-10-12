/**
 * TypeScript types for Dynamic Entity system
 * Provides type safety and better IntelliSense
 */

// Core Entity Definition interface
export interface EntityDefinition {
  _id: string;
  entity_name: string;
  display_name: string;
  plural_name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  is_global: boolean;
  tenant_id?: string;
  organisation_id?: string;
  createdAt: string;
  updatedAt: string;
}

// Dynamic API Routes structure
export interface DynamicApiRoutes {
  get: {
    method: string;
    endpoint: string;
    identifier: string;
  };
  create: {
    method: string;
    endpoint: string;
    identifier: string;
  };
  update: {
    method: string;
    endpoint: string;
    identifier: string;
  };
  delete: {
    method: string;
    endpoint: string;
    identifier: string;
  };
}

// Configuration for GenericCrudPage
export interface DynamicEntityConfig {
  title: string;
  columns: any[];
  formItems: any[];
  apiRoutes: DynamicApiRoutes;
  formColumns: number;
  drawerWidth: number;
  skipMetadataWrapping: boolean;
  enableDynamicFields?: boolean;
  enableSuperAdminFilters?: boolean;
}

// Form values change handler type
export type FormValuesChangeHandler = (changedValues: any, allValues: any) => void;

// Hook return types
export interface UseDynamicEntityReturn {
  // State
  entityName: string | undefined;
  entityDef: EntityDefinition | null;
  loading: boolean;
  error: any;
  hasError: boolean;
  isEntityValid: boolean;
  
  // Computed
  dynamicApiRoutes: DynamicApiRoutes | null;
  defaultColumns: any[];
  
  // Actions
  fetchEntityDefinition: () => void;
  goBack: () => void;
  goToEntityDefinitions: () => void;
  
  // Helpers
  entityDefRoute: any;
}

export interface UseEntityExplorerReturn {
  // State
  entities: EntityDefinition[];
  loading: boolean;
  hasEntities: boolean;
  
  // Permissions
  isSuperAdmin: boolean;
  
  // Actions
  navigateToEntity: (entityName: string) => void;
  navigateToDefinitions: () => void;
  fetchEntities: () => void;
  
  // Computed
  entityRoute: any;
}
