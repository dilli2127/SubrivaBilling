import React, { memo } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Space, Spin } from 'antd';
import {
  AppstoreAddOutlined,
  RightOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useEntityExplorer } from './hooks/useEntityExplorer';

const { Title, Paragraph } = Typography;

/**
 * Optimized Entity Explorer - Browse and access all custom entities
 * 
 * Key optimizations:
 * - Uses custom hook for state management
 * - Memoized component to prevent unnecessary re-renders
 * - Better separation of concerns
 */
const EntityExplorer: React.FC = memo(() => {
  const {
    entities,
    loading,
    hasEntities,
    hasPermission,
    navigateToEntity,
    navigateToDefinitions,
  } = useEntityExplorer();

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
          {hasPermission && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={navigateToDefinitions}
            >
              Manage Entity Definitions
            </Button>
          )}
        </Col>
      </Row>

      {!hasEntities ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <AppstoreAddOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
            <Title level={4} style={{ marginTop: 16 }}>
              No Custom Entities
            </Title>
            <Paragraph type="secondary">
              {hasPermission
                ? 'Create your first custom entity to get started'
                : 'Contact your administrator to create custom entities'}
            </Paragraph>
            {hasPermission && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={navigateToDefinitions}
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
                onClick={() => navigateToEntity(entity.entity_name)}
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
});

EntityExplorer.displayName = 'EntityExplorer';

export default EntityExplorer;

