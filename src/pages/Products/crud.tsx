import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Input, Select, Space, Switch, Tag, Button } from 'antd';
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
  ScanOutlined,
} from '@ant-design/icons';
import BarcodeScanner from '../../components/common/BarcodeScanner';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { Product } from '../../types/entities';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { getCurrentUserRole } from '../../helpers/auth';

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
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

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

  const [scannerVisible, setScannerVisible] = useState(false);
  const [currentForm, setCurrentForm] = useState<any>(null);

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
        label: 'Barcode',
        name: 'barcode',
        rules: [],
        component: (
          <Input.Group compact>
            <Input
              placeholder="Enter or scan barcode"
              style={{ width: 'calc(100% - 100px)' }}
              onFocus={() => setCurrentForm('barcode')}
            />
            <Button
              type="primary"
              icon={<ScanOutlined />}
              onClick={() => setScannerVisible(true)}
              style={{ width: '100px' }}
            >
              Scan
            </Button>
          </Input.Group>
        ),
      },
      {
        label: 'HSN Code',
        name: 'hsn_code',
        rules: [],
        component: <Input placeholder="Enter HSN code" />,
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
      {
        label: 'Brand Name',
        name: 'brand_name',
        rules: [],
        component: <Input placeholder="Enter brand name" />,
      },
      ...(isSuperAdmin ? [{
        label: 'Business Type',
        name: 'business_type',
        rules: [{ required: true, message: 'Please select business type!' }],
        component: (
          <Select
            placeholder="Select business type"
            allowClear
          >
            <Option value="Supermarket / Grocery Store">Supermarket / Grocery Store</Option>
            <Option value="Medical / Pharmacy">Medical / Pharmacy</Option>
            <Option value="Hardware Store">Hardware Store</Option>
            <Option value="Hardware and Electronics Store">Hardware and Electronics Store</Option>
            <Option value="Electronics Store">Electronics Store</Option>
            <Option value="Stationery / Book Store">Stationery / Book Store</Option>
            <Option value="Clothing / Textile Store">Clothing / Textile Store</Option>
            <Option value="Footwear Store">Footwear Store</Option>
            <Option value="Bakery / Sweet Shop">Bakery / Sweet Shop</Option>
            <Option value="Fruits & Vegetables Shop">Fruits & Vegetables Shop</Option>
            <Option value="Furniture Store">Furniture Store</Option>
            <Option value="Automobile / Spare Parts">Automobile / Spare Parts</Option>
            <Option value="Mobile Accessories Store">Mobile Accessories Store</Option>
            <Option value="Cosmetics / Beauty Store">Cosmetics / Beauty Store</Option>
            <Option value="Jewellery / Fancy Store">Jewellery / Fancy Store</Option>
            <Option value="Pet Store">Pet Store</Option>
            <Option value="General Store">General Store</Option>
            <Option value="Wholesale Business">Wholesale Business</Option>
            <Option value="Computer & Laptop Store">Computer & Laptop Store</Option>
            <Option value="Mobile And Laptop Store">Mobile And Laptop Store</Option>
            <Option value="Electrical Store">Electrical Store</Option>
            <Option value="Restaurant / Café">Restaurant / Café</Option>
          </Select>
        ),
      },
      {
        label: 'Global Product',
        name: 'global_product',
        valuePropName: 'checked',
        component: (
          <Switch
            checkedChildren="Yes"
            unCheckedChildren="No"
            defaultChecked={false}
          />
        ),
      }] : []),
    ],
    apiRoutes: getEntityApiRoutes('Product'),
    formColumns: 2,
    canEdit: (record: Product) => {
      // If global_product is true, only superadmin can edit
      if (record.global_product) {
        return isSuperAdmin;
      }
      // Otherwise, all users can edit
      return true;
    },
    canDelete: (record: Product) => {
      // If global_product is true, only superadmin can delete
      if (record.global_product) {
        return isSuperAdmin;
      }
      // Otherwise, all users can delete
      return true;
    },
  }), [variantMap, categoryMap, variantItems, categoryItems, variantLoading, categoryLoading, isSuperAdmin]);

  // Handle barcode scan
  const handleBarcodeScan = (barcode: string) => {
    setScannerVisible(false);
    if (currentForm === 'barcode') {
      // Find the barcode input field and set its value
      const barcodeInput = document.querySelector('input[name="barcode"]') as HTMLInputElement;
      if (barcodeInput) {
        barcodeInput.value = barcode;
        barcodeInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  return (
    <>
      <GenericCrudPage
        config={productConfig}
        enableDynamicFields={true}
        entityName="products"
      />
      
      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScan}
        title="Scan Product Barcode"
        description="Scan barcode to add to product"
      />
    </>
  );
};

export default ProductCrud;
