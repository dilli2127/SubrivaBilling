import React from 'react';
import { Card, Row, Col, Typography, Space, Button } from 'antd';
import VirtualizedTable from '../components/common/VirtualizedTable';
import { useGenericCrudRTK } from '../hooks/useGenericCrudRTK';

const { Title, Paragraph } = Typography;

/**
 * Example component showing how to use the new RTK system with createCrudRoutes
 * This demonstrates the integration between RTK Query and your existing API system
 */
const RTKUsageExample: React.FC = () => {
  // Example 1: Using the generic CRUD hook for Products
  const productColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      width: 100,
      render: (value: number) => `$${value?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 150,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      width: 100,
    },
  ];

  // Example 2: Using the generic CRUD hook for Customers
  const customerColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 250,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      width: 150,
    },
  ];

  // Example 3: Using the generic CRUD hook for Categories
  const categoryColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 300,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>RTK Query Integration with createCrudRoutes</Title>
      
      <Paragraph>
        This example demonstrates how the new RTK Query system integrates with your existing 
        createCrudRoutes and auto API generation system. The VirtualizedTable component now 
        uses RTK Query for data fetching, caching, and state management.
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Products Table (RTK + createCrudRoutes)" size="small">
            <VirtualizedTable
              entityName="Product"
              columns={productColumns}
              height={300}
              showActions={true}
              enablePagination={true}
              pageSize={5}
              onEdit={(record) => console.log('Edit product:', record)}
              onDelete={(record) => console.log('Delete product:', record)}
              onRefresh={() => console.log('Refresh products')}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Customers Table (RTK + createCrudRoutes)" size="small">
            <VirtualizedTable
              entityName="Customer"
              columns={customerColumns}
              height={250}
              showActions={true}
              enablePagination={true}
              pageSize={5}
              onEdit={(record) => console.log('Edit customer:', record)}
              onDelete={(record) => console.log('Delete customer:', record)}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Categories Table (RTK + createCrudRoutes)" size="small">
            <VirtualizedTable
              entityName="Category"
              columns={categoryColumns}
              height={250}
              showActions={true}
              enablePagination={true}
              pageSize={5}
              onEdit={(record) => console.log('Edit category:', record)}
              onDelete={(record) => console.log('Delete category:', record)}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Key Features" style={{ marginTop: 16 }}>
        <Space direction="vertical" size="small">
          <div>
            <strong>✅ Automatic CRUD Operations:</strong> All CRUD operations are automatically 
            generated based on your createCrudRoutes configuration.
          </div>
          <div>
            <strong>✅ RTK Query Integration:</strong> Built-in caching, background refetching, 
            and optimistic updates.
          </div>
          <div>
            <strong>✅ Authentication:</strong> Uses your existing authentication system with 
            automatic token refresh.
          </div>
          <div>
            <strong>✅ Error Handling:</strong> Comprehensive error handling with user-friendly messages.
          </div>
          <div>
            <strong>✅ Pagination & Filtering:</strong> Built-in pagination, sorting, and filtering support.
          </div>
          <div>
            <strong>✅ TypeScript Support:</strong> Full TypeScript support with proper typing.
          </div>
        </Space>
      </Card>

      <Card title="Usage in Your Components" style={{ marginTop: 16 }}>
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
{`// Example: Using RTK hooks directly in a component
import { useGenericCrudRTK } from '../hooks/useGenericCrudRTK';

const MyComponent = () => {
  const { useGetAll, useCreate, useUpdate, useDelete } = useGenericCrudRTK('Product');
  
  // Get all products with pagination
  const { data, isLoading, error, refetch } = useGetAll({ 
    page: 1, 
    limit: 10 
  });
  
  // Create a new product
  const { create, isLoading: isCreating } = useCreate();
  
  // Update a product
  const { update, isLoading: isUpdating } = useUpdate();
  
  // Delete a product
  const { delete: deleteProduct, isLoading: isDeleting } = useDelete();
  
  const handleCreate = async (productData) => {
    const result = await create(productData);
    if (!result.error) {
      console.log('Product created:', result.data);
    }
  };
  
  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data?.result?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
};`}
        </pre>
      </Card>
    </div>
  );
};

export default RTKUsageExample;
