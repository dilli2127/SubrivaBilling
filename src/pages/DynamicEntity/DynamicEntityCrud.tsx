import React, { useMemo, useCallback } from 'react';
import { Spin, Result, Button } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { useDynamicEntity } from './hooks/useDynamicEntity';
import { DynamicEntityConfig, FormValuesChangeHandler } from './types';

/**
 * Optimized Dynamic CRUD page that generates forms based on EntityDefinition
 * 
 * Key optimizations:
 * - Uses custom hook for state management
 * - Memoized configurations
 * - Better error handling
 * - Reduced re-renders
 */
const DynamicEntityCrud: React.FC = () => {
  const {
    entityName,
    entityDef,
    loading,
    hasError,
    isEntityValid,
    dynamicApiRoutes,
    defaultColumns,
    goBack,
    goToEntityDefinitions,
  } = useDynamicEntity();

  // Memoized configuration to prevent unnecessary re-renders
  const config = useMemo((): DynamicEntityConfig | null => {
    if (!entityDef || !dynamicApiRoutes) return null;

    return {
      title: entityDef.plural_name,
      columns: defaultColumns,
      formItems: [
        // Dynamic fields will be added via field metadata
        // entity_name is automatically injected via handleValuesChange
      ],
      apiRoutes: dynamicApiRoutes,
      formColumns: 2,
      drawerWidth: 700,
      skipMetadataWrapping: true, // Send fields directly without any wrapping
      enableDynamicFields: true,
      enableSuperAdminFilters: true,
    };
  }, [entityDef, dynamicApiRoutes, defaultColumns]);

  // Optimized form values change handler with proper typing
  const handleValuesChange = useCallback<FormValuesChangeHandler>((_changed, all) => {
    // Auto-inject entity_name if not present
    if (entityDef && !all.entity_name) {
      all.entity_name = entityDef.entity_name;
    }
  }, [entityDef]);

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <Spin size="large" tip={`Loading ${entityName} definition...`} />
      </div>
    );
  }

  // Error or not found state
  if (hasError || !isEntityValid || !config) {
    return (
      <Result
        status="404"
        title="Entity Not Found"
        subTitle={`The entity "${entityName}" does not exist or is not active.`}
        extra={
          <div>
            <Button type="primary" onClick={goBack} style={{ marginRight: 8 }}>
              Back to Entities
            </Button>
            <Button onClick={goToEntityDefinitions}>
              Manage Entity Definitions
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <GenericCrudPage
      config={config}
      enableDynamicFields={true}
      entityName={entityDef?.entity_name}
      enableSuperAdminFilters={true}
      onValuesChange={handleValuesChange}
    />
  );
};

export default DynamicEntityCrud;

