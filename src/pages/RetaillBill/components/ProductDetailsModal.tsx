import React, { FC, useEffect, useState } from 'react';
import { Modal, Descriptions, Typography, Tag, Divider } from 'antd';
import { useApiActions } from '../../../services/api/useApiActions';
import { useDynamicSelector } from '../../../services/redux';

const { Title, Text } = Typography;

interface ProductDetailsModalProps {
  visible: boolean;
  onCancel: () => void;
  productId: string;
}

interface ProductDetails {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  selling_price: number;
  mrp: number;
  VariantItem?: {
    variant_name: string;
    variant_code?: string;
  };
  CategoryItem?: {
    name: string;
    tax_percentage: number;
  };
  brand?: string;
  unit?: string;
  min_stock?: number;
  max_stock?: number;
}

const ProductDetailsModal: FC<ProductDetailsModalProps> = ({
  visible,
  onCancel,
  productId,
}) => {
  const { getEntityApi } = useApiActions();
  const ProductsApi = getEntityApi('Product');
  
  const { items: products, loading } = useDynamicSelector(
    ProductsApi.getIdentifier('GetAll')
  );

  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);

  useEffect(() => {
    if (visible && productId && products?.result) {
      const product = products.result.find((p: any) => p._id === productId);
      if (product) {
        setProductDetails(product);
      }
    }
  }, [visible, productId, products]);

  useEffect(() => {
    if (visible && productId && !products?.result) {
      // Load products if not already loaded
      ProductsApi('GetAll');
    }
  }, [visible, productId, products, ProductsApi]);

  const handleCancel = () => {
    setProductDetails(null);
    onCancel();
  };

  if (!productDetails) {
    return (
      <Modal
        title="Product Details"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          {loading ? (
            <Text>Loading product details...</Text>
          ) : (
            <Text type="secondary">Product not found</Text>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📦 Product Details</span>
          <Tag color="blue" style={{ margin: 0 }}>
            {productDetails.sku}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div style={{ padding: '16px 0' }}>
        {/* Product Name and Variant */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
            {productDetails.name}
          </Title>
          {productDetails.VariantItem?.variant_name && (
            <Tag color="green" style={{ fontSize: '12px' }}>
              Variant: {productDetails.VariantItem.variant_name}
            </Tag>
          )}
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* Product Information */}
        <Descriptions
          title="Product Information"
          column={2}
          size="small"
          bordered
          style={{ marginBottom: '24px' }}
        >
          <Descriptions.Item label="Product Name" span={2}>
            <Text strong>{productDetails.name}</Text>
          </Descriptions.Item>
          
          {productDetails.VariantItem?.variant_name && (
            <Descriptions.Item label="Variant Name">
              <Text>{productDetails.VariantItem.variant_name}</Text>
            </Descriptions.Item>
          )}
          
          {productDetails.VariantItem?.variant_code && (
            <Descriptions.Item label="Variant Code">
              <Text code>{productDetails.VariantItem.variant_code}</Text>
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label="SKU">
            <Text code>{productDetails.sku}</Text>
          </Descriptions.Item>
          
          {productDetails.brand && (
            <Descriptions.Item label="Brand">
              <Text>{productDetails.brand}</Text>
            </Descriptions.Item>
          )}
          
          {productDetails.unit && (
            <Descriptions.Item label="Unit">
              <Text>{productDetails.unit}</Text>
            </Descriptions.Item>
          )}
          
          {productDetails.description && (
            <Descriptions.Item label="Description" span={2}>
              <Text>{productDetails.description}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Pricing Information */}
        <Descriptions
          title="Pricing & Tax"
          column={2}
          size="small"
          bordered
          style={{ marginBottom: '24px' }}
        >
          <Descriptions.Item label="Selling Price">
            <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
              ₹{productDetails.selling_price?.toFixed(2) || '0.00'}
            </Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="MRP">
            <Text style={{ color: '#fa8c16' }}>
              ₹{productDetails.mrp?.toFixed(2) || '0.00'}
            </Text>
          </Descriptions.Item>
          
          {productDetails.CategoryItem?.name && (
            <Descriptions.Item label="Category">
              <Text>{productDetails.CategoryItem.name}</Text>
            </Descriptions.Item>
          )}
          
          {productDetails.CategoryItem?.tax_percentage !== undefined && (
            <Descriptions.Item label="Tax Rate">
              <Tag color="orange">
                {productDetails.CategoryItem.tax_percentage}%
              </Tag>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Stock Information */}
        {(productDetails.min_stock !== undefined || productDetails.max_stock !== undefined) && (
          <Descriptions
            title="Stock Information"
            column={2}
            size="small"
            bordered
          >
            {productDetails.min_stock !== undefined && (
              <Descriptions.Item label="Minimum Stock">
                <Text>{productDetails.min_stock}</Text>
              </Descriptions.Item>
            )}
            
            {productDetails.max_stock !== undefined && (
              <Descriptions.Item label="Maximum Stock">
                <Text>{productDetails.max_stock}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}

        {/* Footer Information */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: '#f6f8fa', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Right-click on product field to view details • Press ESC to close
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailsModal;
