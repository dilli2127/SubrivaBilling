import React, { useMemo, useCallback } from 'react';
import { Spin, Result, Button } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { useDynamicEntity } from './hooks/useDynamicEntity';
import { DynamicEntityConfig, FormValuesChangeHandler } from './types';

/**
 * Optimized Dynamic CRUD page with column customization
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

  const config = useMemo((): DynamicEntityConfig | null => {
    if (!entityDef || !dynamicApiRoutes) return null;

    return {
      title: entityDef.plural_name,
      columns: defaultColumns,
      formItems: [],
      apiRoutes: dynamicApiRoutes,
      formColumns: 2,
      drawerWidth: 700,
      skipMetadataWrapping: true,
      metadataFieldName: 'custom_data',
      enableDynamicFields: true,
      enableSuperAdminFilters: true,
    };
  }, [entityDef, dynamicApiRoutes, defaultColumns]);

  const handleValuesChange = useCallback<FormValuesChangeHandler>((_changed, all) => {
    if (entityDef && !all.entity_name) {
      all.entity_name = entityDef.entity_name;
    }
  }, [entityDef]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip={`Loading ${entityName} definition...`} />
      </div>
    );
  }

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

