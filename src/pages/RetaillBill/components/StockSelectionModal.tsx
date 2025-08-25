import React, { useEffect, useState, FC, KeyboardEvent, useRef } from 'react';
import { Modal, Table, Input, Tag, Tooltip, message } from 'antd';
import type { InputRef } from 'antd/es/input';
import { useApiActions } from '../../../services/api/useApiActions';
import type { ColumnType } from 'antd/es/table';
import { useDynamicSelector } from '../../../services/redux';
import dayjs from 'dayjs';
import { ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { Stock } from '../../../types/entities';

const { Search } = Input;

interface StockSelectionModalProps {
  visible: boolean;
  onSelect: (stock: {
    id: string;
    _id: string;
    batch_no: string;
    name: string;
    code?: string;
    available_quantity: number;
    sell_price: number;
  }) => void;
  onCancel: () => void;
  productId: string;
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
  const [errorMessage, setErrorMessage] = useState<string>('');
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<InputRef>(null);

  // Helper function to check if stock is expired
  const isStockExpired = (stock: Stock): boolean => {
    return !!(stock.expiry_date && dayjs(stock.expiry_date).isBefore(dayjs()));
  };

  // Helper function to show expired stock error message
  const showExpiredStockError = (stock: Stock) => {
    const expiryDate = dayjs(stock.expiry_date).format('DD/MM/YYYY');
    const errorMsg = `Cannot select expired stock! This item expired on ${expiryDate}. Please select a valid stock item.`;
    setErrorMessage(errorMsg);
    message.error(errorMsg);
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  };

  const filteredStocks: Stock[] =
    stocks?.result?.filter((s: Stock) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        s.batch_no?.toLowerCase().includes(searchLower) ||
        s.ProductItem?.name?.toLowerCase().includes(searchLower) ||
        s.ProductItem?.VariantItem?.variant_name?.toLowerCase().includes(searchLower) ||
        s.available_quantity?.toString().includes(searchLower) ||
        s.sell_price?.toString().includes(searchLower)
      );
    }) || [];

  // Show all stocks including expired ones, but disable selection of expired items
  const allStocks = filteredStocks;

  useEffect(() => {
    setHighlightedIndex(0);
    setErrorMessage(''); // Clear any existing error messages
    if (allStocks.length > 0) {
      // Find the first non-expired stock
      let firstValidIndex = 0;
      while (firstValidIndex < allStocks.length && 
             allStocks[firstValidIndex].expiry_date && 
             dayjs(allStocks[firstValidIndex].expiry_date).isBefore(dayjs())) {
        firstValidIndex++;
      }
      if (firstValidIndex < allStocks.length) {
        setSelectedRowKey(allStocks[firstValidIndex]._id);
        setHighlightedIndex(firstValidIndex);
      } else {
        setSelectedRowKey(null);
      }
    } else {
      setSelectedRowKey(null);
    }
  }, [searchTerm, visible, stocks]);

  useEffect(() => {
    if (visible) {
      setErrorMessage(''); // Clear error messages when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [visible]);

  useEffect(() => {
    if (tableBodyRef.current) {
      const row = tableBodyRef.current.querySelector(
        `.ant-table-row[data-row-key='${allStocks[highlightedIndex]?._id}']`
      ) as HTMLElement;
      row?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, allStocks]);

  useEffect(() => {
    if (visible && productId) {
      StockApi('GetAll', { product: productId });
    }
  }, [visible, productId, StockApi]);

  const columns: ColumnType<Stock>[] = [
    { 
      title: 'Product', 
      dataIndex: 'ProductItem', 
      key: 'product',
      render: (ProductItem: any) => ProductItem?.name || 'N/A'
    },
    { 
      title: 'Variant', 
      dataIndex: 'ProductItem', 
      key: 'variant',
      render: (ProductItem: any) => ProductItem?.VariantItem?.variant_name || 'N/A'
    },
    { title: 'Batch No', dataIndex: 'batch_no', key: 'batch_no' },
    { title: 'Available', dataIndex: 'available_quantity', key: 'available_quantity' },
    { title: 'Price', dataIndex: 'sell_price', key: 'sell_price' },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (expiry_date: string, record: Stock) => {
        if (!expiry_date) return <span style={{ color: '#999' }}>No Expiry</span>;
        
        const expiryDate = dayjs(expiry_date);
        const today = dayjs();
        const isExpired = expiryDate.isBefore(today);
        const daysUntilExpiry = expiryDate.diff(today, 'days');
        
        let color = 'green';
        let icon = <CheckCircleOutlined />;
        let status = 'Valid';
        
        if (isExpired) {
          color = 'red';
          icon = <ExclamationCircleOutlined />;
          status = 'Expired';
        } else if (daysUntilExpiry <= 30) {
          color = 'orange';
          icon = <ExclamationCircleOutlined />;
          status = `Expires in ${daysUntilExpiry} days`;
        }
        
        return (
          <Tooltip title={status}>
            <Tag color={color} icon={icon}>
              {expiryDate.format('DD/MM/YYYY')}
            </Tag>
          </Tooltip>
        );
      }
    },
  ];

  const handleSelectRow = (stock: Stock) => {
    // Check if stock is expired and show error message
    if (isStockExpired(stock)) {
      showExpiredStockError(stock);
      return;
    }
    
    // Clear any existing error message
    setErrorMessage('');
    
    onSelect({
      id: stock._id,
      _id: stock._id,
      batch_no: stock.batch_no,
      name: stock.ProductItem?.name || stock.name || '',
      code: stock.code,
      available_quantity: stock.available_quantity,
      sell_price: stock.sell_price,
    });
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!allStocks.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        let next = prev + 1;
        // Skip over expired items
        while (next < allStocks.length && 
               allStocks[next].expiry_date && 
               dayjs(allStocks[next].expiry_date).isBefore(dayjs())) {
          next++;
        }
        const finalNext = Math.min(next, allStocks.length - 1);
        setSelectedRowKey(allStocks[finalNext]._id);
        return finalNext;
      });
      // Keep focus on search input
      searchInputRef.current?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        let prevIndex = prev - 1;
        // Skip over expired items
        while (prevIndex >= 0 && 
               allStocks[prevIndex].expiry_date && 
               dayjs(allStocks[prevIndex].expiry_date).isBefore(dayjs())) {
          prevIndex--;
        }
        const finalPrev = Math.max(prevIndex, 0);
        setSelectedRowKey(allStocks[finalPrev]._id);
        return finalPrev;
      });
      // Keep focus on search input
      searchInputRef.current?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedStock = allStocks[highlightedIndex];
      if (selectedStock) {
        handleSelectRow(selectedStock);
        // Only close modal if selection was successful (not expired)
        if (!isStockExpired(selectedStock)) {
          onCancel(); // Close the modal after selection
        }
      }
    }
  };

  const handleTableKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!allStocks.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => {
        let next = i + 1;
        // Skip over expired items
        while (next < allStocks.length && 
               allStocks[next].expiry_date && 
               dayjs(allStocks[next].expiry_date).isBefore(dayjs())) {
          next++;
        }
        const finalNext = Math.min(next, allStocks.length - 1);
        setSelectedRowKey(allStocks[finalNext]._id);
        return finalNext;
      });
      // Keep focus on search input
      searchInputRef.current?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => {
        let prev = i - 1;
        // Skip over expired items
        while (prev >= 0 && 
               allStocks[prev].expiry_date && 
               dayjs(allStocks[prev].expiry_date).isBefore(dayjs())) {
          prev--;
        }
        const finalPrev = Math.max(prev, 0);
        setSelectedRowKey(allStocks[finalPrev]._id);
        return finalPrev;
      });
      // Keep focus on search input
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedStock = allStocks[highlightedIndex];
      if (selectedStock) {
        handleSelectRow(selectedStock);
        // Only close modal if selection was successful (not expired)
        if (!isStockExpired(selectedStock)) {
          onCancel(); // Close the modal after selection
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      searchInputRef.current?.focus();
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };

  // Auto-focus back to search input when clicking outside
  const handleModalClick = () => {
    searchInputRef.current?.focus();
  };

  return (
    <Modal
      title="Select Stock (F7 to reopen anytime)"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <div onClick={handleModalClick}>
        <Search
          ref={searchInputRef}
          placeholder="Search stocks (use ↑↓ arrows to navigate, Enter to select)"
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
        
        {/* Error Message Display */}
        {errorMessage && (
          <div style={{ 
            marginBottom: 16, 
            padding: '12px 16px', 
            backgroundColor: '#fff2f0', 
            border: '1px solid #ffccc7', 
            borderRadius: '6px',
            color: '#cf1322',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ExclamationCircleOutlined style={{ color: '#cf1322' }} />
            {errorMessage}
          </div>
        )}
        
        <div
          onKeyDown={handleTableKeyDown}
          tabIndex={0}
          ref={tableBodyRef}
          style={{ outline: 'none' }}
        >
        <Table
          dataSource={allStocks}
          columns={columns}
          loading={loading}
          rowKey="_id"
          size="small"
          pagination={false}
          title={() => (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <span>Stock Items</span>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <span style={{ color: '#52c41a' }}>🟢 Valid</span>
                <span style={{ margin: '0 8px', color: '#faad14' }}>🟠 Near Expiry</span>
                <span style={{ color: '#ff4d4f' }}>🔴 Expired (Disabled)</span>
              </div>
            </div>
          )}
          onRow={(record, idx) => {
            const isExpired = isStockExpired(record);
            return {
              onClick: () => {
                if (!isExpired) {
                  handleSelectRow(record);
                  // Keep focus on search input after selection
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 10);
                } else {
                  // Show error message for expired item
                  showExpiredStockError(record);
                }
              },
              onDoubleClick: () => {
                if (!isExpired) {
                  handleSelectRow(record);
                } else {
                  // Show error message for expired item
                  showExpiredStockError(record);
                }
              },
              className:
                idx === highlightedIndex
                  ? 'ant-table-row ant-table-row-selected'
                  : 'ant-table-row',
              'data-row-key': record._id,
              style: {
                opacity: isExpired ? 0.6 : 1,
                cursor: isExpired ? 'not-allowed' : 'pointer',
                backgroundColor: isExpired ? '#f5f5f5' : undefined
              }
            };
          }}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
            onChange: (keys: React.Key[]) => {
              setSelectedRowKey(keys[0]);
              const idx = allStocks.findIndex(s => s._id === keys[0]);
              if (idx !== -1) setHighlightedIndex(idx);
            },
            getCheckboxProps: (record: Stock) => ({
              disabled: isStockExpired(record)
            })
          }}
        />
        <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
          <strong>Keyboard Shortcuts:</strong> ↑↓ Navigate stocks | Enter Select | Escape Cancel
          <br />
          <strong>Tip:</strong> Press F7 anytime to reopen this modal for stock changes
          <br />
          <strong>Note:</strong> Expired items (🔴) are shown but cannot be selected. Navigation automatically skips expired items.
          <br />
          <strong>Error Handling:</strong> Attempting to select expired items will show an error message and prevent selection.
        </div>
        </div>
      </div>
    </Modal>
  );
};

export default StockSelectionModal; 