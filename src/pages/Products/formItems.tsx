import React from 'react';
import { Input, Select, Switch, Button } from 'antd';
import { ScanOutlined } from '@ant-design/icons';

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

interface FormItemsParams {
  categoryItems: any;
  variantItems: any;
  categoryLoading: boolean;
  variantLoading: boolean;
  isSuperAdmin: boolean;
  onScanClick: () => void;
  onBarcodeInputFocus: () => void;
}

export const productsFormItems = ({
  categoryItems,
  variantItems,
  categoryLoading,
  variantLoading,
  isSuperAdmin,
  onScanClick,
  onBarcodeInputFocus,
}: FormItemsParams) => [
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
          onFocus={onBarcodeInputFocus}
        />
        <Button
          type="primary"
          icon={<ScanOutlined />}
          onClick={onScanClick}
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
    rules: [{ required: false, message: 'Please select business type!' }],
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
];

