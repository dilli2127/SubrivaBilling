import React, { useEffect, useState, FC, KeyboardEvent, useRef } from 'react';
import { Modal, Table, Input } from 'antd';
import type { InputRef } from 'antd/es/input';
import { useApiActions } from '../../../services/api/useApiActions';
import type { ColumnType } from 'antd/es/table';
import { useDynamicSelector } from '../../../services/redux';

const { Search } = Input;

interface Stock {
  id: string;
  name: string;
  code: string;
  available_quantity: number;
  sell_price: number;
}

interface StockSelectionModalProps {
  visible: boolean;
  onSelect: (stock: Stock) => void;
  onCancel: () => void;
  productId: string; // <-- Add this
}

const StockSelectionModal: FC<StockSelectionModalProps> = ({
  visible,
  onSelect,
  onCancel,
  productId, // <-- Destructure
}) => {
  const { getEntityApi } = useApiActions();
  const StockApi = getEntityApi('StockAudit');
  const { items: stocks, loading } = useDynamicSelector(
    StockApi.getIdentifier('GetAll')
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowKey, setSelectedRowKey] = useState<React.Key | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<InputRef>(null);

  const filteredStocks: Stock[] =
    stocks?.result?.filter((s: Stock) =>
      Object.values(s).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) || [];

  useEffect(() => {
    setHighlightedIndex(0);
    if (filteredStocks.length > 0) {
      setSelectedRowKey(filteredStocks[0].id);
    } else {
      setSelectedRowKey(null);
    }
  }, [searchTerm, visible, stocks]);

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
        `.ant-table-row[data-row-key='${filteredStocks[highlightedIndex]?.id}']`
      ) as HTMLElement;
      row?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, filteredStocks]);

  useEffect(() => {
    if (visible && productId) {
      StockApi('GetAll', { product_id: productId });
    }
  }, [visible, productId, StockApi]);

  const columns: ColumnType<Stock>[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Available', dataIndex: 'available_quantity', key: 'available_quantity' },
    { title: 'Price', dataIndex: 'sell_price', key: 'sell_price' },
  ];

  const handleSelectRow = (stock: Stock) => {
    onSelect(stock);
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filteredStocks.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(0);
      setSelectedRowKey(filteredStocks[0].id);
      setTimeout(() => {
        tableBodyRef.current?.focus();
      }, 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(filteredStocks.length - 1);
      setSelectedRowKey(filteredStocks[filteredStocks.length - 1].id);
      setTimeout(() => {
        tableBodyRef.current?.focus();
      }, 0);
    }
  };

  const handleTableKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!filteredStocks.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => {
        const next = Math.min(i + 1, filteredStocks.length - 1);
        setSelectedRowKey(filteredStocks[next].id);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => {
        const prev = Math.max(i - 1, 0);
        setSelectedRowKey(filteredStocks[prev].id);
        return prev;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedStock = filteredStocks[highlightedIndex];
      if (selectedStock) {
        handleSelectRow(selectedStock);
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
      title="Select Stock"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Search
        ref={searchInputRef}
        placeholder="Search stocks"
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
          dataSource={filteredStocks}
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
              const idx = filteredStocks.findIndex(s => s.id === keys[0]);
              if (idx !== -1) setHighlightedIndex(idx);
            },
          }}
        />
      </div>
    </Modal>
  );
};

export default StockSelectionModal; 