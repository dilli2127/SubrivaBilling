import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  Modal,
  Input,
  Typography,
  Tag,
  Table,
} from 'antd';
import {
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useGenericCrudRTK } from '../../../hooks/useGenericCrudRTK';
import { apiSlice } from '../../../services/redux/api/apiSlice';

const { Text } = Typography;

interface Vendor {
  _id: string;
  vendor_name: string;
  email: string;
  contact_number: string;
  address: string;
  vendor_type?: string;
}

interface VendorSelectionModalProps {
  visible: boolean;
  onSelect: (vendor: Vendor) => void;
  onCancel: () => void;
}

const VendorSelectionModalComponent: React.FC<VendorSelectionModalProps> = ({
  visible,
  onSelect,
  onCancel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);

  const searchInputRef = useRef<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingMoreRef = useRef(false);

  // RTK Query hooks for Vendor with pagination
  const { data: vendorData, isLoading: vendorLoading } = 
    apiSlice.useGetVendorQuery(
      { 
        searchString: debouncedSearchTerm,
        pageNumber: page,
        pageLimit: 10
      },
      { 
        skip: !visible,
        refetchOnMountOrArgChange: true,
      }
    );

  // Accumulate vendors for infinite scroll
  useEffect(() => {
    if (!visible) return;
    
    if (vendorData) {
      const newItems = (vendorData as any)?.result || [];
      const totalCount = (vendorData as any).pagination?.totalCount || (vendorData as any).pagination?.total || 0;
      
      if (page === 1) {
        setAllVendors(newItems);
        setHasMore(newItems.length < totalCount && newItems.length > 0);
      } else {
        setAllVendors(prev => {
          const existingIds = new Set(prev.map((item: any) => item._id));
          const uniqueNewItems = newItems.filter((item: any) => !existingIds.has(item._id));
          const updated = [...prev, ...uniqueNewItems];
          setHasMore(updated.length < totalCount && uniqueNewItems.length > 0);
          return updated;
        });
      }
      
      isLoadingMoreRef.current = false;
    }
  }, [vendorData, page, visible]);

  const filteredVendors = allVendors;

  // Memoized vendor type color function
  const getVendorTypeColor = useCallback((type?: string) => {
    const colorMap: Record<string, string> = {
      premium: 'gold',
      wholesale: 'blue',
      regular: 'green',
    };
    return colorMap[type || 'regular'] || 'green';
  }, []);

  // Debounce search term for API calls with pagination reset
  useEffect(() => {
    if (!visible) return;

    if (searchTerm === debouncedSearchTerm) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
      setAllVendors([]);
      setHasMore(true);
      isLoadingMoreRef.current = false;
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, debouncedSearchTerm, visible]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setPage(1);
      setHasMore(true);
      isLoadingMoreRef.current = false;
    } else {
      setSearchTerm('');
      setDebouncedSearchTerm('');
      setPage(1);
      setAllVendors([]);
      setHasMore(true);
      isLoadingMoreRef.current = false;
    }
  }, [visible]);

  // Handle search input change
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setSelectedVendor(null);
    setSelectedRowIndex(-1);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (visible && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 100);
    }
  }, [visible]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchTerm('');
      setDebouncedSearchTerm('');
      setSelectedVendor(null);
      setSelectedRowIndex(-1);
    }
  }, [visible]);

  // Consolidated keyboard navigation function
  const navigateToVendor = useCallback(
    (direction: 'up' | 'down' | 'first' | 'last') => {
      if (filteredVendors.length === 0) return;

      let newIndex = selectedRowIndex;
      if (direction === 'up') {
        newIndex = selectedRowIndex <= 0 ? filteredVendors.length - 1 : selectedRowIndex - 1;
      } else if (direction === 'down') {
        newIndex = selectedRowIndex >= filteredVendors.length - 1 ? 0 : selectedRowIndex + 1;
      } else if (direction === 'first') {
        newIndex = 0;
      } else if (direction === 'last') {
        newIndex = filteredVendors.length - 1;
      }

      setSelectedRowIndex(newIndex);
      setSelectedVendor(filteredVendors[newIndex]);

      // Scroll selected row into view
      setTimeout(() => {
        const selectedRow = document.querySelector(
          '.vendor-selection-table .ant-table-row-selected'
        );
        if (selectedRow) {
          selectedRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }, 0);
    },
    [filteredVendors, selectedRowIndex]
  );

  // Handle vendor selection
  const handleVendorSelect = useCallback(
    (vendor: Vendor) => {
      onSelect(vendor);
      onCancel();
    },
    [onSelect, onCancel]
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateToVendor('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateToVendor('up');
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigateToVendor('first');
      } else if (e.key === 'End') {
        e.preventDefault();
        navigateToVendor('last');
      } else if (e.key === 'Enter' && selectedVendor) {
        e.preventDefault();
        handleVendorSelect(selectedVendor);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [navigateToVendor, selectedVendor, handleVendorSelect, onCancel]
  );

  // Memoized table columns
  const columns = useMemo(
    () => [
      {
        title: '',
        key: 'select',
        width: 60,
        render: (text: string, record: Vendor) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid #6366f1',
                backgroundColor:
                  selectedVendor?._id === record._id ? '#6366f1' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {selectedVendor?._id === record._id && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                  }}
                />
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Vendor Name',
        dataIndex: 'vendor_name',
        key: 'vendor_name',
        render: (text: string, record: Vendor) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShopOutlined style={{ color: '#6366f1' }} />
            <Text strong>{text}</Text>
            {record.vendor_type && (
              <Tag color={getVendorTypeColor(record.vendor_type)}>
                {record.vendor_type.toUpperCase()}
              </Tag>
            )}
          </div>
        ),
      },
      {
        title: 'Contact Number',
        dataIndex: 'contact_number',
        key: 'contact_number',
        render: (text: string) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PhoneOutlined style={{ color: '#666' }} />
            <Text>{text || '-'}</Text>
          </div>
        ),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: (text: string) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MailOutlined style={{ color: '#666' }} />
            <Text>{text || '-'}</Text>
          </div>
        ),
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        render: (text: string) => (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <HomeOutlined style={{ color: '#666', marginTop: '2px' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {text || '-'}
            </Text>
          </div>
        ),
      },
    ],
    [selectedVendor, getVendorTypeColor]
  );

  // Memoized table row props
  const getRowProps = useCallback(
    (record: Vendor, index?: number) => ({
      onClick: () => {
        setSelectedVendor(record);
        setSelectedRowIndex(index ?? -1);
      },
      onDoubleClick: () => handleVendorSelect(record),
      style: {
        cursor: 'pointer',
        backgroundColor:
          selectedVendor?._id === record._id ? '#f0f5ff' : 'transparent',
      },
      className:
        selectedVendor?._id === record._id ? 'ant-table-row-selected' : '',
    }),
    [selectedVendor, handleVendorSelect]
  );

  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    setSelectedVendor(null);
    setSelectedRowIndex(-1);
  }, []);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShopOutlined style={{ color: '#6366f1', fontSize: 18 }} />
          <span>Select Vendor</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      afterOpenChange={open => {
        if (open && searchInputRef.current) {
          setTimeout(() => {
            searchInputRef.current?.focus();
            searchInputRef.current?.select();
          }, 100);
        }
      }}
    >
      <div
        ref={modalRef}
        style={{ marginBottom: 16 }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <Input
          ref={searchInputRef}
          placeholder="Search vendors... (Click to highlight, Double-click or Enter to select)"
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: '100%' }}
          onFocus={handleSearchFocus}
          autoFocus
          suffix={
            searchTerm && vendorLoading ? (
              <div style={{ fontSize: '12px', color: '#999' }}>
                Searching...
              </div>
            ) : null
          }
        />
      </div>

      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {vendorLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text>Loading vendors...</Text>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">
              {searchTerm
                ? 'No vendors found matching your search.'
                : 'No vendors available.'}
            </Text>
          </div>
        ) : (
          <div
            onScroll={(e: any) => {
              const target = e.currentTarget;
              const scrollTop = target.scrollTop;
              const scrollHeight = target.scrollHeight;
              const clientHeight = target.clientHeight;
              const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
              
              if (scrollPercentage > 0.7 && hasMore && !vendorLoading && !isLoadingMoreRef.current) {
                isLoadingMoreRef.current = true;
                setPage(prev => prev + 1);
              }
            }}
            style={{ maxHeight: 360, overflowY: 'auto' }}
          >
            <Table
              columns={columns}
              dataSource={filteredVendors}
              rowKey="_id"
              pagination={false}
              size="small"
              scroll={{ y: undefined }}
              onRow={getRowProps}
              className="vendor-selection-table"
            />
            {hasMore && filteredVendors.length > 0 && (
              <div style={{ textAlign: 'center', padding: '8px', color: '#999', borderTop: '1px solid #f0f0f0' }}>
                {vendorLoading ? 'Loading more...' : 'Scroll for more vendors'}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: '#f0f5ff',
          borderRadius: 8,
          fontSize: '12px',
        }}
      >
        <Text type="secondary">
          <strong>Shortcuts:</strong> Click to highlight • Double-click or Enter to select • ↑↓ Navigate • Esc Close • Home/End First/Last
        </Text>
      </div>
    </Modal>
  );
};

// Memoize the component to prevent unnecessary re-renders
const VendorSelectionModal = React.memo(VendorSelectionModalComponent);

export default VendorSelectionModal;

