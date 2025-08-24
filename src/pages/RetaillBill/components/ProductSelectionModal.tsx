import React, { useEffect, useState, FC, KeyboardEvent, useRef } from 'react';
import { Modal, Table, Input } from 'antd';
import type { InputRef } from 'antd/es/input';
import { useApiActions } from '../../../services/api/useApiActions';
import type { ColumnType } from 'antd/es/table';
import { useDynamicSelector } from '../../../services/redux';

const { Search } = Input;

interface Product {
  id: string;
  name: string;
  sku: string;
  selling_price: number;
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
  const searchInputRef = useRef<InputRef>(null);

  const filteredProducts: Product[] =
    products?.result?.filter((p: Product) =>
      Object.values(p).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) || [];

  useEffect(() => {
    setHighlightedIndex(0);
    if (filteredProducts.length > 0) {
      setSelectedRowKey(filteredProducts[0].id);
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
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Price', dataIndex: 'selling_price', key: 'selling_price' },
  ];

  const handleSelectRow = (product: Product) => {
    onSelect(product);
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filteredProducts.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const next = Math.min(prev + 1, filteredProducts.length - 1);
        setSelectedRowKey(filteredProducts[next].id);
        return next;
      });
      // Keep focus on search input
      searchInputRef.current?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const prevIndex = Math.max(prev - 1, 0);
        setSelectedRowKey(filteredProducts[prevIndex].id);
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
      title="Select Product"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <div onClick={handleModalClick}>
        <Search
          ref={searchInputRef}
          placeholder="Search products (use ↑↓ arrows to navigate, Enter to select)"
          onChange={e => setSearchTerm(e.target.value)}
          style={{ marginBottom: 16 }}
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
        />
        <Table
          dataSource={filteredProducts}
          columns={columns}
          loading={loading}
          rowKey="id"
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
              const idx = filteredProducts.findIndex(p => p.id === keys[0]);
              if (idx !== -1) setHighlightedIndex(idx);
            },
          }}
          scroll={{ y: 300 }}
        />
        <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
          <strong>Keyboard Shortcuts:</strong> ↑↓ Navigate products | Enter Select | Escape Cancel
        </div>
      </div>
    </Modal>
  );
};

export default ProductSelectionModal;
