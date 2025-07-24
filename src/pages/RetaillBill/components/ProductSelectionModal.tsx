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
  const tableBodyRef = useRef<HTMLDivElement>(null);
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
      }, 0);
    }
  }, [visible]);

  useEffect(() => {
    if (tableBodyRef.current) {
      const row = tableBodyRef.current.querySelector(
        `.ant-table-row[data-row-key='${filteredProducts[highlightedIndex]?.id}']`
      ) as HTMLElement;
      row?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, filteredProducts]);

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
      setHighlightedIndex(0);
      setSelectedRowKey(filteredProducts[0].id);
      setTimeout(() => {
        tableBodyRef.current?.focus();
      }, 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(filteredProducts.length - 1);
      setSelectedRowKey(filteredProducts[filteredProducts.length - 1].id);
      setTimeout(() => {
        tableBodyRef.current?.focus();
      }, 0);
    }
  };

  const handleTableKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!filteredProducts.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => {
        const next = Math.min(i + 1, filteredProducts.length - 1);
        setSelectedRowKey(filteredProducts[next].id);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => {
        const prev = Math.max(i - 1, 0);
        setSelectedRowKey(filteredProducts[prev].id);
        return prev;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedProduct = filteredProducts[highlightedIndex];
      if (selectedProduct) {
        handleSelectRow(selectedProduct);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      searchInputRef.current?.focus();
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
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
      <Search
        ref={searchInputRef}
        placeholder="Search products"
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16 }}
        autoFocus
        onKeyDown={handleSearchKeyDown}
      />
      <div
        onKeyDown={handleTableKeyDown}
        tabIndex={0}
        ref={tableBodyRef}
        style={{ outline: 'none' }}
      >
        <Table
          dataSource={filteredProducts}
          columns={columns}
          loading={loading}
          rowKey="id"
          size="small"
          pagination={false}
          onRow={(record, idx) => ({
            onClick: () => handleSelectRow(record),
            onDoubleClick: () => handleSelectRow(record),
            className:
              idx === highlightedIndex
                ? 'ant-table-row ant-table-row-selected'
                : 'ant-table-row',
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
        />
      </div>
    </Modal>
  );
};

export default ProductSelectionModal;
