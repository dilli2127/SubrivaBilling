import React, { useEffect, useState, FC, KeyboardEvent, useRef } from 'react';
import { Modal, Table, Input, Button, Space, message } from 'antd';
import type { InputRef } from 'antd/es/input';
import { BarcodeOutlined, ScanOutlined } from '@ant-design/icons';
import { useApiActions } from '../../../services/api/useApiActions';
import type { ColumnType } from 'antd/es/table';
import { useDynamicSelector } from '../../../services/redux';
import BarcodeScanner from '../../../components/common/BarcodeScanner';

const { Search } = Input;

interface Product {
  _id: string;
  name?: string;
  sku?: string;
  selling_price?: number;
  VariantItem?: {
    variant_name?: string;
    variant_code?: string;
  };
}

interface ProductSelectionModalProps {
  visible: boolean;
  onSelect: (product: Product) => void;
  onCancel: () => void;
}

const ProductSelectionModal: FC<ProductSelectionModalProps> = ({
  visible,
  onSelect,
  onCancel,
}) => {
  const { getEntityApi } = useApiActions();
  const ProductsApi = getEntityApi('Product');
  const { items: products, loading } = useDynamicSelector(
    ProductsApi.getIdentifier('GetAll')
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowKey, setSelectedRowKey] = useState<React.Key | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [scannerVisible, setScannerVisible] = useState(false);
  const searchInputRef = useRef<InputRef>(null);

  const filteredProducts: Product[] =
    products?.result?.filter((p: Product) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (p.name?.toLowerCase() || '').includes(searchLower) ||
        (p.sku?.toLowerCase() || '').includes(searchLower) ||
        p.VariantItem?.variant_name?.toLowerCase().includes(searchLower) ||
        p.VariantItem?.variant_code?.toLowerCase().includes(searchLower) ||
        (p.selling_price?.toString() || '').includes(searchLower)
      );
    }).sort((a: Product, b: Product) => {
      // Prioritize exact matches and matches at the beginning
      const searchLower = searchTerm.toLowerCase();
      
      // Check for exact matches first
      const aExactMatch = (a.name?.toLowerCase() || '') === searchLower || 
                          a.VariantItem?.variant_name?.toLowerCase() === searchLower ||
                          (a.sku?.toLowerCase() || '') === searchLower;
      const bExactMatch = (b.name?.toLowerCase() || '') === searchLower || 
                          b.VariantItem?.variant_name?.toLowerCase() === searchLower ||
                          (b.sku?.toLowerCase() || '') === searchLower;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Then check for matches at the beginning
      const aStartsWith = (a.name?.toLowerCase() || '').startsWith(searchLower) || 
                          a.VariantItem?.variant_name?.toLowerCase().startsWith(searchLower) ||
                          (a.sku?.toLowerCase() || '').startsWith(searchLower);
      const bStartsWith = (b.name?.toLowerCase() || '').startsWith(searchLower) || 
                          b.VariantItem?.variant_name?.toLowerCase().startsWith(searchLower) ||
                          (b.sku?.toLowerCase() || '').startsWith(searchLower);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return 0;
    }) || [];

  useEffect(() => {
    setHighlightedIndex(0);
    if (filteredProducts.length > 0) {
              setSelectedRowKey(filteredProducts[0]._id);
    } else {
      setSelectedRowKey(null);
    }
  }, [searchTerm, visible, products]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const columns: ColumnType<Product>[] = [
    { 
      title: 'Product & Variant', 
      dataIndex: 'name', 
      key: 'name', 
      width: 250,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1890ff' }}>{name}</div>
          {record.VariantItem?.variant_name && (
            <div style={{ fontSize: '12px', color: '#52c41a', marginTop: '2px' }}>
              Variant: {record.VariantItem.variant_name}
              {record.VariantItem?.variant_code && (
                <span style={{ marginLeft: '8px', color: '#fa8c16', fontSize: '11px' }}>
                  ({record.VariantItem.variant_code})
                </span>
              )}
            </div>
          )}
        </div>
      )
    },
    { title: 'Variant', dataIndex: 'VariantItem', key: 'variant', width: 120, 
      render: (variant) => variant?.variant_name ? (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>{variant.variant_name}</span>
      ) : (
        <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>No variant</span>
      ) },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120 },
    { title: 'Price', dataIndex: 'selling_price', key: 'selling_price', width: 100,
      render: (price) => (
        <span style={{ 
          color: '#52c41a', 
          fontWeight: 600, 
          fontSize: '14px' 
        }}>
          ₹{price?.toFixed(2) || '0.00'}
        </span>
      ) },
  ];

  const handleSelectRow = (product: Product) => {
    onSelect(product);
  };

  // Handle barcode scan
  const handleBarcodeScan = (barcode: string) => {
    setSearchTerm(barcode);
    setScannerVisible(false);
    
    // Try to find product by barcode/SKU
    const foundProduct = products?.result?.find((p: Product) => {
      const searchLower = barcode.toLowerCase();
      return (
        (p.sku?.toLowerCase() || '').includes(searchLower) ||
        (p.name?.toLowerCase() || '').includes(searchLower) ||
        p.VariantItem?.variant_code?.toLowerCase().includes(searchLower)
      );
    });

    if (foundProduct) {
      // Auto-select the found product
      setTimeout(() => {
        onSelect(foundProduct);
      }, 500);
      message.success(`Product found: ${foundProduct.name}`);
    } else {
      message.warning(`No product found with barcode: ${barcode}`);
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filteredProducts.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const next = Math.min(prev + 1, filteredProducts.length - 1);
        setSelectedRowKey(filteredProducts[next]._id);
        return next;
      });
      // Keep focus on search input
      searchInputRef.current?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const prevIndex = Math.max(prev - 1, 0);
        setSelectedRowKey(filteredProducts[prevIndex]._id);
        return prevIndex;
      });
      // Keep focus on search input
      searchInputRef.current?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedProduct = filteredProducts[highlightedIndex];
      if (selectedProduct) {
        handleSelectRow(selectedProduct);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  // Auto-focus back to search input when clicking outside
  const handleModalClick = () => {
    searchInputRef.current?.focus();
  };

  return (
    <Modal
      title="Select Product & Variant (F5 to reopen anytime)"
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={null}
      destroyOnClose
    >
      <div onClick={handleModalClick}>
        <Space.Compact style={{ marginBottom: 16, width: '100%' }}>
          <Search
            ref={searchInputRef}
            placeholder="Search by product name, variant, SKU, or price (use ↑↓ arrows to navigate, Enter to select)"
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
            autoFocus
            onKeyDown={handleSearchKeyDown}
            onBlur={() => {
              // Re-focus after a short delay to ensure it stays focused
              setTimeout(() => {
                if (visible) {
                  searchInputRef.current?.focus();
                }
              }, 10);
            }}
            value={searchTerm}
          />
          <Button 
            type="primary" 
            icon={<ScanOutlined />}
            onClick={() => setScannerVisible(true)}
            style={{ minWidth: 100 }}
          >
            Scan
          </Button>
        </Space.Compact>
        <Table
          dataSource={filteredProducts}
          columns={columns}
          loading={loading}
          rowKey="_id"
          size="small"
          pagination={false}
          onRow={(record, idx) => ({
            onClick: () => {
              handleSelectRow(record);
              // Keep focus on search input after selection
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 10);
            },
            onDoubleClick: () => handleSelectRow(record),
            className:
              idx === highlightedIndex
                ? 'ant-table-row ant-table-row-selected'
                : 'ant-table-row',
            style: {
              backgroundColor: idx === highlightedIndex ? '#e6f7ff' : undefined,
              border: idx === highlightedIndex ? '2px solid #1890ff' : undefined,
            },
          })}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
            onChange: keys => {
              setSelectedRowKey(keys[0]);
              const idx = filteredProducts.findIndex(p => p._id === keys[0]);
              if (idx !== -1) setHighlightedIndex(idx);
            },
          }}
          scroll={{ y: 300 }}
        />
              <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
        <strong>Keyboard Shortcuts:</strong> ↑↓ Navigate products | Enter Select | Escape Cancel
        <br />
        <strong>Search:</strong> Product name, variant name, SKU, or price
        <br />
        <strong>Barcode Scanner:</strong> Click "Scan" button or use USB barcode scanner
        <br />
        <strong>Tip:</strong> Press F5 anytime to reopen this modal for product changes
      </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScan}
        title="Scan Product Barcode"
        description="Scan barcode to find product automatically"
      />
    </Modal>
  );
};

export default ProductSelectionModal;
