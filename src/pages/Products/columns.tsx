import React, { useMemo } from 'react';
import { Space, Tag } from 'antd';
import {
  AppstoreOutlined,
  BarcodeOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  TagOutlined,
  TagsOutlined,
} from '@ant-design/icons';

interface ColumnsParams {
  variantMap: Record<string, string>;
  isSuperAdmin: boolean;
}

// Memoized render functions to prevent recreation
const NameRenderer = React.memo(({ text }: { text: string }) => (
  <Space>
    <TagsOutlined style={{ color: '#1890ff' }} />
    <strong>{text}</strong>
  </Space>
));

const CategoryRenderer = React.memo(({ CategoryItem }: { CategoryItem: any }) => (
  <Tag icon={<AppstoreOutlined />} color="geekblue">
    {CategoryItem?.category_name || '-'}
  </Tag>
));

const SKURenderer = React.memo(({ sku }: { sku: string }) => (
  <Space>
    <BarcodeOutlined style={{ color: '#722ed1' }} />
    <span>{sku || '-'}</span>
  </Space>
));

const BarcodeRenderer = React.memo(({ barcode }: { barcode: string }) => (
  <Tag color="green" icon={<BarcodeOutlined />}>
    {barcode || '-'}
  </Tag>
));

const HSNCodeRenderer = React.memo(({ hsnCode }: { hsnCode: string }) => (
  <Tag color="orange">
    {hsnCode || '-'}
  </Tag>
));

const VariantRenderer = React.memo(({ id, variantMap }: { id: string; variantMap: Record<string, string> }) => (
  <Tag icon={<TagOutlined />} color="purple">
    {variantMap[id] || '-'}
  </Tag>
));

const StatusRenderer = React.memo(({ status }: { status: boolean }) =>
  status ? (
    <Tag
      icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
      color="success"
    >
      Active
    </Tag>
  ) : (
    <Tag
      icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />}
      color="error"
    >
      Inactive
    </Tag>
  )
);

const BrandNameRenderer = React.memo(({ brandName }: { brandName: string }) => (
  <Tag color="cyan">
    {brandName || '-'}
  </Tag>
));

const BusinessTypeRenderer = React.memo(({ businessType }: { businessType: string }) => (
  <Tag color="blue">
    {businessType || '-'}
  </Tag>
));

const GlobalProductRenderer = React.memo(({ globalProduct }: { globalProduct: boolean }) => (
  globalProduct ? (
    <Tag
      icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
      color="success"
    >
      Yes
    </Tag>
  ) : (
    <Tag color="default">
      No
    </Tag>
  )
));

export const productsColumns = ({ variantMap, isSuperAdmin }: ColumnsParams) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => <NameRenderer text={text} />,
  },
  {
    title: 'Category',
    dataIndex: 'CategoryItem',
    key: 'category',
    render: (CategoryItem: any) => <CategoryRenderer CategoryItem={CategoryItem} />,
  },
  {
    title: 'SKU',
    dataIndex: 'sku',
    key: 'sku',
    render: (sku: string) => <SKURenderer sku={sku} />,
  },
  {
    title: 'Barcode',
    dataIndex: 'barcode',
    key: 'barcode',
    render: (barcode: string) => <BarcodeRenderer barcode={barcode} />,
  },
  {
    title: 'HSN Code',
    dataIndex: 'hsn_code',
    key: 'hsn_code',
    render: (hsnCode: string) => <HSNCodeRenderer hsnCode={hsnCode} />,
  },
  {
    title: 'Variant',
    dataIndex: 'variant',
    key: 'variant',
    render: (id: string) => <VariantRenderer id={id} variantMap={variantMap} />,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: boolean) => <StatusRenderer status={status} />,
  },
  {
    title: 'Brand Name',
    dataIndex: 'brand_name',
    key: 'brand_name',
    render: (brandName: string) => <BrandNameRenderer brandName={brandName} />,
  },
  ...(isSuperAdmin ? [{
    title: 'Business Type',
    dataIndex: 'business_type',
    key: 'business_type',
    render: (businessType: string) => <BusinessTypeRenderer businessType={businessType} />,
  },
  {
    title: 'Global Product',
    dataIndex: 'global_product',
    key: 'global_product',
    render: (globalProduct: boolean) => <GlobalProductRenderer globalProduct={globalProduct} />,
  }] : [
    {
      title: 'Global Product',
      dataIndex: 'global_product',
      key: 'global_product',
      render: (globalProduct: boolean) => <GlobalProductRenderer globalProduct={globalProduct} />,
    }
  ]),
];

