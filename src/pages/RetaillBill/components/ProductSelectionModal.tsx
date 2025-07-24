import React, { useEffect, useState, FC, KeyboardEvent } from 'react';
import { Modal, Table, Input } from 'antd';
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

  const filteredProducts = products?.result?.filter((p: Product) =>
    Object.values(p).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns: ColumnType<Product>[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Price', dataIndex: 'selling_price', key: 'selling_price' },
  ];

  const handleSelectRow = (product: Product) => {
    onSelect(product);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && selectedRowKey) {
      const selectedProduct = filteredProducts?.find(
        (p: Product) => p.id === selectedRowKey
      );
      if (selectedProduct) {
        handleSelectRow(selectedProduct);
      }
    }
    // Add up/down arrow navigation if needed
  };

  return (
    <Modal
      title="Select Product"
      visible={visible}
      onCancel={onCancel}
      onOk={() => {
        const selectedProduct = filteredProducts?.find(
          (p: Product) => p.id === selectedRowKey
        );
        if (selectedProduct) {
          handleSelectRow(selectedProduct);
        }
      }}
      width={800}
      footer={null} // Or customize footer
    >
      <Search
        placeholder="Search products"
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16 }}
        autoFocus
      />
      <div onKeyDown={handleKeyDown}>
        <Table
          dataSource={filteredProducts}
          columns={columns}
          loading={loading}
          rowKey="id"
          size="small"
          onRow={record => ({
            onClick: () => handleSelectRow(record),
            onDoubleClick: () => handleSelectRow(record),
          })}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
            onChange: keys => setSelectedRowKey(keys[0]),
          }}
        />
      </div>
    </Modal>
  );
};

export default ProductSelectionModal;
