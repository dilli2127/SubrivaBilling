import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { dynamic_request, useDynamicSelector } from '../../services/redux';
import { useDispatch } from 'react-redux';
import { createApiRouteGetter } from '../../helpers/Common_functions';
import { Dispatch } from 'redux';

interface EntityDefinition {
  _id: string;
  entity_name: string;
  display_name: string;
  plural_name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  is_global: boolean;
}

/**
 * Dynamic CRUD page that generates forms based on EntityDefinition
 */
const DynamicEntityCrud: React.FC = () => {
  const { entityName } = useParams<{ entityName: string }>();
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const [entityDef, setEntityDef] = useState<EntityDefinition | null>(null);

  // Fetch entity definition
  const getApiRoute = createApiRouteGetter('EntityDefinition');
  const entityDefRoute = getApiRoute('Get');
  const { loading, items, error } = useDynamicSelector(
    entityDefRoute.identifier
  );

  useEffect(() => {
    if (entityName) {
      dispatch(
        dynamic_request(
          {
            method: entityDefRoute.method,
            endpoint: entityDefRoute.endpoint,
            data: { entity_name: entityName },
          },
          entityDefRoute.identifier
        )
      );
    }
  }, [entityName, dispatch, entityDefRoute]);

  useEffect(() => {
    if (items?.result && Array.isArray(items.result) && items.result.length > 0) {
      setEntityDef(items.result[0]);
    }
  }, [items]);

  // Generate API routes for dynamic entity (matches backend structure)
  const dynamicApiRoutes = useMemo(() => {
    if (!entityName) return null;
    
    const baseEndpoint = `/${entityName}`;
    
    return {
      get: {
        method: 'POST',
        endpoint: baseEndpoint,
        identifier: `GetAll_${entityName}`,
      },
      create: {
        method: 'PUT',
        endpoint: baseEndpoint,
        identifier: `Add_${entityName}`,
      },
      update: {
        method: 'POST',
        endpoint: baseEndpoint,
        identifier: `Update_${entityName}`,
      },
      delete: {
        method: 'DELETE',
        endpoint: baseEndpoint,
        identifier: `Delete_${entityName}`,
      },
    };
  }, [entityName]);

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
        <Spin size="large" tip="Loading entity definition..." />
      </div>
    );
  }

  // Error or not found
  if (error || !entityDef || !entityDef.is_active) {
    return (
      <Result
        status="404"
        title="Entity Not Found"
        subTitle={`The entity "${entityName}" does not exist or is not active.`}
        extra={
          <Button type="primary" onClick={() => navigate('/entities')}>
            Back to Entity Definitions
          </Button>
        }
      />
    );
  }

  if (!dynamicApiRoutes) {
    return null;
  }

  // Build config for the dynamic entity
  const config = {
    title: entityDef.plural_name,
    columns: [
      {
        title: 'ID',
        dataIndex: '_id',
        key: '_id',
        render: (text: string) => text.substring(0, 8) + '...',
      },
      {
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date: string) => new Date(date).toLocaleDateString(),
      },
      {
        title: 'Updated',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (date: string) => new Date(date).toLocaleDateString(),
      },
    ],
    formItems: [
      // Dynamic fields will be added via field metadata
      // entity_name is automatically injected via handleValuesChange
    ],
    apiRoutes: dynamicApiRoutes,
    formColumns: 2,
    drawerWidth: 700,
    skipMetadataWrapping: true, // Send fields directly without any wrapping
    // dynamicFieldNames will be auto-populated by enableDynamicFields
  };

  // Helper to inject entity_name into form values
  const handleValuesChange = (_changed: any, all: any) => {
    // Auto-inject entity_name if not present
    if (!all.entity_name) {
      all.entity_name = entityDef.entity_name;
    }
  };

  return (
    <GenericCrudPage
      config={config}
      enableDynamicFields={true}
      entityName={entityDef.entity_name}
      enableSuperAdminFilters={true}
      onValuesChange={handleValuesChange}
    />
  );
};

export default DynamicEntityCrud;

