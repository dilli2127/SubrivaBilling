import React from 'react';
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

export const productsColumns = ({ variantMap, isSuperAdmin }: ColumnsParams) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => (
      <Space>
        <TagsOutlined style={{ color: '#1890ff' }} />
        <strong>{text}</strong>
      </Space>
    ),
  },
  {
    title: 'Category',
    dataIndex: 'CategoryItem',
    key: 'category',
    render: (CategoryItem: any) => (
      <Tag icon={<AppstoreOutlined />} color="geekblue">
        {CategoryItem?.category_name || '-'}
      </Tag>
    ),
  },
  {
    title: 'SKU',
    dataIndex: 'sku',
    key: 'sku',
    render: (sku: string) => (
      <Space>
        <BarcodeOutlined style={{ color: '#722ed1' }} />
        <span>{sku || '-'}</span>
      </Space>
    ),
  },
  {
    title: 'Barcode',
    dataIndex: 'barcode',
    key: 'barcode',
    render: (barcode: string) => (
      <Tag color="green" icon={<BarcodeOutlined />}>
        {barcode || '-'}
      </Tag>
    ),
  },
  {
    title: 'HSN Code',
    dataIndex: 'hsn_code',
    key: 'hsn_code',
    render: (hsnCode: string) => (
      <Tag color="orange">
        {hsnCode || '-'}
      </Tag>
    ),
  },
  {
    title: 'Variant',
    dataIndex: 'variant',
    key: 'variant',
    render: (id: string) => (
      <Tag icon={<TagOutlined />} color="purple">
        {variantMap[id] || '-'}
      </Tag>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: boolean) =>
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
      ),
  },
  {
    title: 'Brand Name',
    dataIndex: 'brand_name',
    key: 'brand_name',
    render: (brandName: string) => (
      <Tag color="cyan">
        {brandName || '-'}
      </Tag>
    ),
  },
  ...(isSuperAdmin ? [{
    title: 'Business Type',
    dataIndex: 'business_type',
    key: 'business_type',
    render: (businessType: string) => (
      <Tag color="blue">
        {businessType || '-'}
      </Tag>
    ),
  },
  {
    title: 'Global Product',
    dataIndex: 'global_product',
    key: 'global_product',
    render: (globalProduct: boolean) => (
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
    ),
  }] : [
    {
      title: 'Global Product',
      dataIndex: 'global_product',
      key: 'global_product',
      render: (globalProduct: boolean) => (
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
      ),
    }
  ]),
];

