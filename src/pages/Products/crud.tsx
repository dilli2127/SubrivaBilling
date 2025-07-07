import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Input, Select, Space, Switch, Tag } from 'antd';
import { createApiRouteGetter } from '../../helpers/Common_functions';
import { dynamic_request, useDynamicSelector } from '../../services/redux';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import {
  AppstoreOutlined,
  BarcodeOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  TagOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';

const { Option } = Select;

type Variant = {
  _id: string;
  variant_name: string;
  unit: string;
  pack_type: string;
  pack_size: string;
};

type Category = {
  _id: string;
  category_name: string;
};

const ProductCrud: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();

  const getApiRouteVariant = createApiRouteGetter('Variant');
  const getApiRouteCategory = createApiRouteGetter('Category');

  const variantRoute = getApiRouteVariant('Get');
  const categoryRoute = getApiRouteCategory('Get');

  const { loading: variantLoading, items: variantItems } = useDynamicSelector(
    variantRoute.identifier
  );
  const { loading: categoryLoading, items: categoryItems } = useDynamicSelector(
    categoryRoute.identifier
  );

  const [variantMap, setVariantMap] = useState<Record<string, string>>({});
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  const fetchData = useCallback(() => {
    [variantRoute, categoryRoute].forEach(route => {
      dispatch(
        dynamic_request(
          { method: route.method, endpoint: route.endpoint, data: {} },
          route.identifier
        )
      );
    });
  }, [dispatch, variantRoute, categoryRoute]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createMap = (items: any[], labelKey: string) =>
    items.reduce((acc: Record<string, string>, item) => {
      acc[item._id] = item[labelKey];
      return acc;
    }, {});

  useEffect(() => {
    setVariantMap(createMap(variantItems?.result || [], 'variant_name'));
  }, [variantItems]);

  useEffect(() => {
    setCategoryMap(createMap(categoryItems?.result || [], 'category_name'));
  }, [categoryItems]);

  const productConfig = useMemo(() => ({
    title: 'Products',
    columns: [
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
    ],
    formItems: [
      {
        label: 'Product Name',
        name: 'name',
        rules: [{ required: true, message: 'Please enter the product name!' }],
        component: <Input placeholder="e.g., HP Toner 85A" />,
      },
      {
        label: 'Category',
        name: 'category',
        rules: [{ required: true, message: 'Please select a category!' }],
        component: (
          <Select
            placeholder="Select category"
            loading={categoryLoading}
            showSearch
            allowClear
          >
            {(categoryItems?.result || []).map((cat: Category) => (
              <Option key={cat._id} value={cat._id}>
                {cat.category_name}
              </Option>
            ))}
          </Select>
        ),
      },
      {
        label: 'SKU / Code',
        name: 'sku',
        rules: [],
        component: <Input placeholder="Optional SKU code" />,
      },
      {
        label: 'Variant',
        name: 'variant',
        rules: [{ required: true, message: 'Please select a variant!' }],
        component: (
          <Select
            placeholder="Select variant"
            loading={variantLoading}
            allowClear
            showSearch
          >
            {(variantItems?.result || []).map((variant: Variant) => (
              <Option key={variant._id} value={variant._id}>
                {variant.variant_name} - {variant.unit} - {variant.pack_type} (
                {variant.pack_size})
              </Option>
            ))}
          </Select>
        ),
      },
      {
        label: 'Status',
        name: 'status',
        valuePropName: 'checked',
        component: (
          <Switch
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            defaultChecked
          />
        ),
      },
    ],
    apiRoutes: getEntityApiRoutes('Product'),
    formColumns: 2,
  }), [variantMap, categoryMap, variantItems, categoryItems, variantLoading, categoryLoading]);

  return (
    <GenericCrudPage
      config={productConfig}
    />
  );
};

export default ProductCrud;
