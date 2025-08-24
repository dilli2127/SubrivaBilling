import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Modal, Input, Button, Typography, message, Form, Select, Space, Divider, Tag, Table } from 'antd';
import { SearchOutlined, UserAddOutlined, UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { useApiActions } from '../../../services/api/useApiActions';
import { useDynamicSelector } from '../../../services/redux';

const { Title, Text } = Typography;
const { Option } = Select;

interface Customer {
  _id: string;
  full_name: string;
  email: string;
  mobile: string;
  address: string;
  customer_type: 'regular' | 'vip' | 'wholesale';
}

interface CustomerSelectionModalProps {
  visible: boolean;
  onSelect: (customer: Customer) => void;
  onCancel: () => void;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
  visible,
  onSelect,
  onCancel,
}) => {
  const { getEntityApi } = useApiActions();
  const CustomerApi = getEntityApi('Customer');
  
  const { items: customerList, loading: customerLoading } = useDynamicSelector(
    CustomerApi.getIdentifier('GetAll')
  );
  const { loading: createLoading } = useDynamicSelector(
    CustomerApi.getIdentifier('Create')
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
  const [form] = Form.useForm();
  const searchInputRef = useRef<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized filtered customers
  const filteredCustomers = useMemo(() => customerList?.result || [], [customerList?.result]);

  // Memoized customer type color function
  const getCustomerTypeColor = useCallback((type: string) => {
    const colorMap: Record<string, string> = {
      vip: 'gold',
      wholesale: 'blue',
      regular: 'green'
    };
    return colorMap[type] || 'green';
  }, []);

  // Consolidated keyboard navigation function
  const navigateToCustomer = useCallback((direction: 'up' | 'down' | 'home' | 'end') => {
    if (filteredCustomers.length === 0) return;

    let newIndex: number;
    switch (direction) {
      case 'up':
        newIndex = selectedRowIndex === -1 ? filteredCustomers.length - 1 : Math.max(selectedRowIndex - 1, 0);
        break;
      case 'down':
        newIndex = selectedRowIndex === -1 ? 0 : Math.min(selectedRowIndex + 1, filteredCustomers.length - 1);
        break;
      case 'home':
        newIndex = 0;
        break;
      case 'end':
        newIndex = filteredCustomers.length - 1;
        break;
      default:
        return;
    }

    setSelectedRowIndex(newIndex);
    setSelectedCustomer(filteredCustomers[newIndex]);

    // Scroll to the selected row
    setTimeout(() => {
      const rowElement = document.querySelector(`[data-row-key="${filteredCustomers[newIndex]._id}"]`) as HTMLElement;
      if (rowElement) {
        const scrollBehavior = direction === 'home' ? 'start' : direction === 'end' ? 'end' : 'nearest';
        rowElement.scrollIntoView({ behavior: 'smooth', block: scrollBehavior });
      }
    }, 100);
  }, [filteredCustomers, selectedRowIndex]);

  // Debounced search function
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        CustomerApi('GetAll', { search: value.trim() });
      } else {
        CustomerApi('GetAll');
      }
    }, 500);
  }, [CustomerApi]);

  // Handle customer selection
  const handleCustomerSelect = useCallback((customer: Customer) => {
    console.log('CustomerSelectionModal handleCustomerSelect called for:', customer.full_name);
    console.log('Timestamp:', new Date().toISOString());
    
    setSelectedCustomer(customer);
    onSelect(customer);
    setTimeout(() => onCancel(), 100);
  }, [onSelect, onCancel]);

  // Handle new customer creation
  const handleCreateCustomer = useCallback(async (values: any) => {
    try {
      const response: any = await CustomerApi('Create', values);
      if (response?.statusCode === 200) {
        message.success('Customer created successfully!');
        setShowAddForm(false);
        form.resetFields();
        CustomerApi('GetAll');
        // Don't auto-select the newly created customer
        // User can manually select it if needed
      }
    } catch (error) {
      message.error('Failed to create customer');
    }
  }, [CustomerApi, form]);

  // Handle keyboard events (excluding Enter key which is handled by input field)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    console.log('Local handleKeyDown called for key:', e.key);
    
    if (e.key === 'Escape') {
      onCancel();
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      
      const directionMap: Record<string, 'up' | 'down' | 'home' | 'end'> = {
        ArrowDown: 'down',
        ArrowUp: 'up',
        Home: 'home',
        End: 'end'
      };
      
      navigateToCustomer(directionMap[e.key]);
    }
  }, [navigateToCustomer, onCancel]);

  // Global keyboard event handler
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if (!visible) return;
    
    console.log('Global handleKeyDown called for key:', e.key);
    
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      e.stopPropagation();
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
      return;
    }
    
    // Only handle navigation keys globally, not Enter key
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      
      const directionMap: Record<string, 'up' | 'down' | 'home' | 'end'> = {
        ArrowDown: 'down',
        ArrowUp: 'up',
        Home: 'home',
        End: 'end'
      };
      
      navigateToCustomer(directionMap[e.key]);
    }
  }, [visible, navigateToCustomer]);

  // Memoized table columns
  const columns = useMemo(() => [
    {
      title: '',
      key: 'select',
      width: 60,
      render: (text: string, record: Customer) => (
        <div
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => {
            setSelectedCustomer(record);
            const index = filteredCustomers.findIndex((c: Customer) => c._id === record._id);
            setSelectedRowIndex(index);
            // Don't auto-select here, let user click the row or press Enter
          }}
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: selectedCustomer?._id === record._id ? '2px solid #1890ff' : '2px solid #d9d9d9',
              backgroundColor: selectedCustomer?._id === record._id ? '#1890ff' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            {selectedCustomer?._id === record._id && (
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
      title: 'Customer Name',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text: string, record: Customer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text strong>{text}</Text>
          <Tag color={getCustomerTypeColor(record.customer_type)}>
            {record.customer_type.toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PhoneOutlined style={{ color: '#666' }} />
          <Text>{text}</Text>
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
  ], [selectedCustomer, filteredCustomers, getCustomerTypeColor]);

  // Memoized table row props
  const getRowProps = useCallback((record: Customer, index?: number) => ({
    onClick: () => {
      setSelectedCustomer(record);
      setSelectedRowIndex(index ?? 0);
      // Don't auto-select on row click, let user press Enter to confirm
    },
    style: {
      cursor: 'pointer',
      backgroundColor: selectedCustomer?._id === record._id ? '#f0f8ff' : 'white',
      border: selectedCustomer?._id === record._id ? '2px solid #1890ff' : '1px solid #f0f0f0',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
    },
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      if (selectedCustomer?._id !== record._id) {
        e.currentTarget.style.backgroundColor = '#f5f5f5';
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      if (selectedCustomer?._id !== record._id) {
        e.currentTarget.style.backgroundColor = 'white';
      }
    },
  }), [selectedCustomer]);

  // Load customers on mount and handle modal close
  useEffect(() => {
    if (visible) {
      CustomerApi('GetAll');
      setSelectedCustomer(null);
      setSelectedRowIndex(-1);
    } else {
      setSearchTerm('');
      setSelectedCustomer(null);
      setSelectedRowIndex(-1);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [visible, CustomerApi]);

  // Focus search input when modal becomes visible
  useEffect(() => {
    if (visible && searchInputRef.current) {
      const focusSearch = () => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      };
      
      focusSearch();
      const timer = setTimeout(focusSearch, 100);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Global keyboard event listener
  useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleGlobalKeyDown, true);
      return () => document.removeEventListener('keydown', handleGlobalKeyDown, true);
    }
  }, [visible, handleGlobalKeyDown]);

  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    setSelectedCustomer(null);
    setSelectedRowIndex(-1);
  }, []);

  return (
    <Modal
      title="Select Customer"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      afterOpenChange={(open) => {
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
        <Space.Compact style={{ width: '100%' }}>
                     <Input
             ref={searchInputRef}
             placeholder="Search customers via API... (Use ↑↓ arrows to navigate, Enter to select, Esc to close)"
             value={searchTerm}
             onChange={(e) => handleSearch(e.target.value)}
             prefix={<SearchOutlined />}
             style={{ flex: 1 }}
             onKeyDown={(e) => {
               // Only handle Enter key in search input, let other keys bubble up
               if (e.key === 'Enter' && selectedCustomer) {
                 console.log('Search input Enter key pressed');
                 handleCustomerSelect(selectedCustomer);
               }
             }}
             onFocus={handleSearchFocus}
             autoFocus
             onBlur={() => {
               setTimeout(() => {
                 if (visible && searchInputRef.current) {
                   searchInputRef.current.focus();
                 }
               }, 10);
             }}
             suffix={searchTerm && customerLoading ? <div style={{ fontSize: '12px', color: '#999' }}>Searching...</div> : null}
           />
          <Button
            type={showAddForm ? 'default' : 'primary'}
            icon={<UserAddOutlined />}
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ minWidth: 120 }}
          >
            {showAddForm ? 'Cancel Add' : 'Add New'}
          </Button>
        </Space.Compact>
      </div>

      {showAddForm && (
        <div style={{ 
          marginBottom: 16, 
          padding: 16, 
          border: '1px solid #d9d9d9', 
          borderRadius: 8,
          backgroundColor: '#fafafa'
        }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <UserAddOutlined /> Add New Customer
          </Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateCustomer}
            size="small"
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item
                name="full_name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input placeholder="Enter full name" prefix={<UserOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="mobile"
                label="Mobile Number"
                rules={[
                  { required: true, message: 'Please enter mobile number' },
                  { pattern: /^[0-9]{10}$/, message: 'Mobile must be 10 digits' }
                ]}
              >
                <Input placeholder="Enter mobile number" prefix={<PhoneOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email" prefix={<MailOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="customer_type"
                label="Customer Type"
                initialValue="regular"
              >
                <Select>
                  <Option value="regular">Regular</Option>
                  <Option value="vip">VIP</Option>
                  <Option value="wholesale">Wholesale</Option>
                </Select>
              </Form.Item>
            </div>
            
            <Form.Item
              name="address"
              label="Address"
            >
              <Input.TextArea 
                placeholder="Enter address" 
                rows={2}
              />
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={createLoading}>
                  Create Customer
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      )}

      <Divider style={{ margin: '16px 0' }} />

      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {customerLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text>Loading customers...</Text>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">
              {searchTerm ? 'No customers found matching your search.' : 'No customers available.'}
            </Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredCustomers}
            rowKey="_id"
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
            onRow={getRowProps}
          />
        )}
      </div>
    </Modal>
  );
};

export default CustomerSelectionModal; 