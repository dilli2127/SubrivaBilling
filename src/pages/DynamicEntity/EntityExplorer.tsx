import React, { useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Space, Spin } from 'antd';
import {
  AppstoreAddOutlined,
  RightOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dynamic_request, useDynamicSelector } from '../../services/redux';
import { useDispatch } from 'react-redux';
import { createApiRouteGetter } from '../../helpers/Common_functions';
import { Dispatch } from 'redux';
import { getCurrentUserRole } from '../../helpers/auth';

const { Title, Paragraph } = Typography;

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
 * Entity Explorer - Browse and access all custom entities
 */
const EntityExplorer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

  // Fetch entity definitions
  const getApiRoute = createApiRouteGetter('EntityDefinition');
  const entityRoute = getApiRoute('Get');
  const { loading, items } = useDynamicSelector(entityRoute.identifier);

  useEffect(() => {
    dispatch(
      dynamic_request(
        {
          method: entityRoute.method,
          endpoint: entityRoute.endpoint,
          data: { is_active: true },
        },
        entityRoute.identifier
      )
    );
  }, [dispatch, entityRoute]);

  const entities: EntityDefinition[] = items?.result || [];

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
        <Spin size="large" tip="Loading entities..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <AppstoreAddOutlined style={{ marginRight: 8 }} />
            Custom Entities
          </Title>
          <Paragraph type="secondary">
            Manage your custom business entities and their data
          </Paragraph>
        </Col>
        <Col>
          {isSuperAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/entity-definitions')}
            >
              Manage Entity Definitions
            </Button>
          )}
        </Col>
      </Row>

      {entities.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <AppstoreAddOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
            <Title level={4} style={{ marginTop: 16 }}>
              No Custom Entities
            </Title>
            <Paragraph type="secondary">
              {isSuperAdmin
                ? 'Create your first custom entity to get started'
                : 'Contact your administrator to create custom entities'}
            </Paragraph>
            {isSuperAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/entity-definitions')}
                style={{ marginTop: 16 }}
              >
                Create Entity Definition
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {entities.map((entity) => (
            <Col xs={24} sm={12} md={8} lg={6} key={entity._id}>
              <Card
                hoverable
                onClick={() => navigate(`/dynamic-entity/${entity.entity_name}`)}
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <AppstoreAddOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                    {entity.is_global && (
                      <Tag color="gold">Global</Tag>
                    )}
                  </div>
                  
                  <div>
                    <Title level={5} style={{ marginBottom: 4 }}>
                      {entity.plural_name}
                    </Title>
                    <Tag color="cyan" style={{ fontSize: 11 }}>
                      {entity.entity_name}
                    </Tag>
                  </div>

                  {entity.description && (
                    <Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: 0, fontSize: 13 }}
                    >
                      {entity.description}
                    </Paragraph>
                  )}

                  <Button
                    type="link"
                    icon={<RightOutlined />}
                    style={{ padding: 0 }}
                  >
                    Open
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default EntityExplorer;

