import React from 'react';
import { Input, Select, Switch, Button } from 'antd';
import { ScanOutlined } from '@ant-design/icons';
import { InfiniteDropdownResult } from '../../hooks/useInfiniteDropdown';

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
  categoryDropdown: InfiniteDropdownResult;
  variantDropdown: InfiniteDropdownResult;
  isSuperAdmin: boolean;
  onScanClick: () => void;
  onBarcodeInputFocus: () => void;
}

export const productsFormItems = ({
  categoryDropdown,
  variantDropdown,
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
        loading={categoryDropdown.loading && categoryDropdown.items.length === 0}
        showSearch
        allowClear
        onSearch={categoryDropdown.setSearchString}
        onPopupScroll={categoryDropdown.handlePopupScroll}
        filterOption={false}
        dropdownRender={(menu) => (
          <>
            {menu}
            {categoryDropdown.hasMore && categoryDropdown.items.length > 0 && (
              <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                {categoryDropdown.loading ? 'Loading...' : 'Scroll for more'}
              </div>
            )}
          </>
        )}
      >
        {categoryDropdown.items.map((cat: Category) => (
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
    component: <Input placeholder="e.g., HP-85A-TONER" />,
  },
  {
    label: 'Barcode',
    name: 'barcode',
    rules: [],
    component: (
      <Input.Group compact>
        <Input
          placeholder="e.g., 1234567890123"
          style={{ width: 'calc(100% - 40px)' }}
          onFocus={onBarcodeInputFocus}
        />
        <Button
          type="primary"
          icon={<ScanOutlined />}
          onClick={onScanClick}
          style={{ width: 40 }}
        />
      </Input.Group>
    ),
  },
  {
    label: 'HSN Code',
    name: 'hsn_code',
    rules: [],
    component: <Input placeholder="e.g., 8443.32.10" />,
  },
  {
    label: 'Variant',
    name: 'variant',
    rules: [{ required: true, message: 'Please select a variant!' }],
    component: (
      <Select
        placeholder="Select variant"
        loading={variantDropdown.loading && variantDropdown.items.length === 0}
        showSearch
        allowClear
        onSearch={variantDropdown.setSearchString}
        onPopupScroll={variantDropdown.handlePopupScroll}
        filterOption={false}
        dropdownRender={(menu) => (
          <>
            {menu}
            {variantDropdown.hasMore && variantDropdown.items.length > 0 && (
              <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                {variantDropdown.loading ? 'Loading...' : 'Scroll for more'}
              </div>
            )}
          </>
        )}
      >
        {variantDropdown.items.map((variant: Variant) => (
          <Option key={variant._id} value={variant._id}>
            {variant.variant_name} ({variant.unit})
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
    component: <Input placeholder="e.g., HP" />,
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
        <Option value="Other">Other</Option>
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
      />
    ),
  }] : []),
];

