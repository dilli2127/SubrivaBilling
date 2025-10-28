import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  Modal,
  Input,
  Button,
  Typography,
  message,
  Form,
  Select,
  Space,
  Divider,
  Tag,
  Table,
  Row,
  Col,
} from 'antd';
import {
  SearchOutlined,
  UserAddOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useApiActions } from '../../../services/api/useApiActions';
import { useDynamicSelector } from '../../../services/redux';
import { useHandleApiResponse } from '../../../components/common/useHandleApiResponse';
import { useGenericCrudRTK } from '../../../hooks/useGenericCrudRTK';

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

interface NewCustomerData {
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

const CustomerSelectionModalComponent: React.FC<CustomerSelectionModalProps> = ({
  visible,
  onSelect,
  onCancel,
}) => {
  const { getEntityApi } = useApiActions();
  const CustomerApi = getEntityApi('Customer');

  // RTK Query hooks for Customer
  const customerRTK = useGenericCrudRTK('Customer');
  const { create: createCustomer, ...createResult } = customerRTK.useCreate();
  const { refetch: refetchCustomerList } = customerRTK.useGetAll({});

  const { items: customerList, loading: customerLoading } = useDynamicSelector(
    CustomerApi.getIdentifier('GetAll')
  );
  const createLoading = createResult.isLoading;

  // Extract items from customerList if it exists
  const customers = customerList?.items || customerList?.result || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
  const [showCreateGrid, setShowCreateGrid] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState<NewCustomerData>({
    full_name: '',
    email: '',
    mobile: '',
    address: '',
    customer_type: 'regular',
  });

  const [form] = Form.useForm();
  const searchInputRef = useRef<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const createGridRef = useRef<HTMLDivElement>(null);
  const firstFormInputRef = useRef<any>(null);

  // Memoized filtered customers
  const filteredCustomers = useMemo(() => customers, [customers]);

  // Check if search has no results and should show create grid
  const shouldShowCreateGrid = useMemo(() => {
    return (
      searchTerm.trim() && !customerLoading && filteredCustomers.length === 0
    );
  }, [searchTerm, customerLoading, filteredCustomers.length]);

  // Memoized customer type color function
  const getCustomerTypeColor = useCallback((type: string) => {
    const colorMap: Record<string, string> = {
      vip: 'gold',
      wholesale: 'blue',
      regular: 'green',
    };
    return colorMap[type] || 'green';
  }, []);

  // Consolidated keyboard navigation function
  const navigateToCustomer = useCallback(
    (direction: 'up' | 'down' | 'home' | 'end') => {
      if (filteredCustomers.length === 0) return;

      let newIndex: number;
      switch (direction) {
        case 'up':
          newIndex =
            selectedRowIndex === -1
              ? filteredCustomers.length - 1
              : Math.max(selectedRowIndex - 1, 0);
          break;
        case 'down':
          newIndex =
            selectedRowIndex === -1
              ? 0
              : Math.min(selectedRowIndex + 1, filteredCustomers.length - 1);
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
        const rowElement = document.querySelector(
          `[data-row-key="${filteredCustomers[newIndex]._id}"]`
        ) as HTMLElement;
        if (rowElement) {
          const scrollBehavior =
            direction === 'home'
              ? 'start'
              : direction === 'end'
                ? 'end'
                : 'nearest';
          rowElement.scrollIntoView({
            behavior: 'smooth',
            block: scrollBehavior,
          });
        }
      }, 100);
    },
    [filteredCustomers, selectedRowIndex]
  );

  // Debounced search function
  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (value.trim()) {
          CustomerApi('GetAll', { searchString: value.trim() });
        } else {
          CustomerApi('GetAll');
        }
      }, 500);
    },
    [CustomerApi]
  );

  // Handle customer selection
  const handleCustomerSelect = useCallback(
    (customer: Customer) => {
      setSelectedCustomer(customer);
      onSelect(customer);
      setTimeout(() => onCancel(), 100);
    },
    [onSelect, onCancel]
  );

  // Function to clear form data
  const clearFormData = useCallback(() => {
    setNewCustomerData({
      full_name: '',
      email: '',
      mobile: '',
      address: '',
      customer_type: 'regular',
    });
    form.resetFields();
  }, [form]);

  // Handle new customer creation from unified form
  const handleCreateCustomerFromForm = useCallback(async () => {
    try {
      // Validate required fields - only Full Name and Mobile are mandatory
      if (!newCustomerData.full_name.trim()) {
        message.error('Full name is required');
        return;
      }
      if (!newCustomerData.mobile.trim()) {
        message.error('Mobile number is required');
        return;
      }

      // Call RTK mutation - the response will be handled by useHandleApiResponse
      const result = await createCustomer(newCustomerData);
      if (!result.error && result.data) {
        // Customer created successfully, get the new customer data
        const newCustomer = result.data?.data || result.data?.result || result.data;
        if (newCustomer) {
          // Clear form and hide form UI
          clearFormData();
          setShowAddForm(false);
          setShowCreateGrid(false);
          
          // Refresh customer list
          refetchCustomerList();
          
          // Select the newly created customer
          setTimeout(() => {
            handleCustomerSelect(newCustomer);
          }, 100);
        }
      }
    } catch (error) {
      message.error('Failed to create customer');
      // Clear form data on error
      clearFormData();
    }
  }, [newCustomerData, createCustomer, handleCustomerSelect, clearFormData, refetchCustomerList]);

  // Handle form field changes
  const handleFormFieldChange = useCallback(
    (field: keyof NewCustomerData, value: string) => {
      setNewCustomerData(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Remove the navigateToNextField function as it's no longer needed

  // Handle keyboard events (excluding Enter key which is handled by input field)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();

        const directionMap: Record<string, 'up' | 'down' | 'home' | 'end'> = {
          ArrowDown: 'down',
          ArrowUp: 'up',
          Home: 'home',
          End: 'end',
        };

        navigateToCustomer(directionMap[e.key]);
      }
    },
    [navigateToCustomer, onCancel]
  );

  // Global keyboard event handler
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!visible) return;

      // Don't interfere if user is typing in form inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('ant-select-selector') ||
        target.closest('.ant-select-dropdown')
      ) {
        return;
      }

      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        e.stopPropagation();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
        return;
      }

      // Handle Ctrl+N for new customer creation
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        e.stopPropagation();
        if (shouldShowCreateGrid) {
          setShowCreateGrid(true);
          setTimeout(() => {
            if (createGridRef.current) {
              const firstInput = createGridRef.current.querySelector(
                'input'
              ) as HTMLInputElement;
              if (firstInput) {
                firstInput.focus();
                firstInput.select();
              }
            }
          }, 100);
        }
        return;
      }

      // Only handle navigation keys globally when not in form inputs
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();

        const directionMap: Record<string, 'up' | 'down' | 'home' | 'end'> = {
          ArrowDown: 'down',
          ArrowUp: 'up',
          Home: 'home',
          End: 'end',
        };

        navigateToCustomer(directionMap[e.key]);
      }
    },
    [visible, navigateToCustomer, shouldShowCreateGrid]
  );

  // Memoized table columns
  const columns = useMemo(
    () => [
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
              alignItems: 'center',
            }}
            onClick={() => {
              setSelectedCustomer(record);
              const index = filteredCustomers.findIndex(
                (c: Customer) => c._id === record._id
              );
              setSelectedRowIndex(index);
              // Don't auto-select here, let user click the row or press Enter
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border:
                  selectedCustomer?._id === record._id
                    ? '2px solid #1890ff'
                    : '2px solid #d9d9d9',
                backgroundColor:
                  selectedCustomer?._id === record._id ? '#1890ff' : 'white',
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
    ],
    [selectedCustomer, filteredCustomers, getCustomerTypeColor]
  );

  // Memoized table row props
  const getRowProps = useCallback(
    (record: Customer, index?: number) => ({
      onClick: () => {
        setSelectedCustomer(record);
        setSelectedRowIndex(index ?? 0);
        // Don't auto-select on row click, let user press Enter to confirm
      },
      style: {
        cursor: 'pointer',
        backgroundColor:
          selectedCustomer?._id === record._id ? '#f0f8ff' : 'white',
        border:
          selectedCustomer?._id === record._id
            ? '2px solid #1890ff'
            : '1px solid #f0f0f0',
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
    }),
    [selectedCustomer]
  );

  // Load customers on mount and handle modal close
  useEffect(() => {
    if (visible) {
      CustomerApi('GetAll');
      setSelectedCustomer(null);
      setSelectedRowIndex(-1);
      setShowCreateGrid(false);
    } else {
      setSearchTerm('');
      setSelectedCustomer(null);
      setSelectedRowIndex(-1);
      setShowCreateGrid(false);
      setShowAddForm(false);
      clearFormData();
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
  }, [visible, CustomerApi, clearFormData]);

  // Auto-show create form when search has no results
  useEffect(() => {
    if (shouldShowCreateGrid && !showCreateGrid && !showAddForm) {
      setShowCreateGrid(true);
    }
  }, [shouldShowCreateGrid, showCreateGrid, showAddForm]);

  // Focus search input when modal becomes visible (but not when create form is shown)
  useEffect(() => {
    if (visible && searchInputRef.current && !showAddForm && !showCreateGrid) {
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
  }, [visible, showAddForm, showCreateGrid]);

  // Focus on first form field when create form is shown
  useEffect(() => {
    if ((showAddForm || showCreateGrid) && visible) {
      const timer = setTimeout(() => {
        if (firstFormInputRef.current) {
          firstFormInputRef.current.focus();
          firstFormInputRef.current.select();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showAddForm, showCreateGrid, visible]); // Depend on all three to trigger when form is shown

  // Remove the useLayoutEffect that was causing focus to reset

  // Global keyboard event listener
  useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleGlobalKeyDown, true);
      return () =>
        document.removeEventListener('keydown', handleGlobalKeyDown, true);
    }
  }, [visible, handleGlobalKeyDown]);

  // Handle API responses using RTK mutations
  useHandleApiResponse({
    action: 'create',
    title: 'Customer',
    mutationResult: createResult,
    refetch: refetchCustomerList,
    entityApi: CustomerApi,
  });

  // Watch createLoading state to show/hide loading message
  useEffect(() => {
    if (createLoading) {
      // Show loading message when API call starts
      message.loading({
        content: 'Creating customer...',
        key: 'customer-creation',
        duration: 0,
      });
    } else {
      // Hide loading message when API call completes
      message.destroy('customer-creation');
    }
  }, [createLoading]);

  // Note: Customer creation success is handled in handleCreateCustomerFromForm
  // The useHandleApiResponse hook handles notifications automatically
  // No need for additional useEffect watching createResult

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
      afterOpenChange={open => {
        if (open && searchInputRef.current && !showAddForm && !showCreateGrid) {
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
            placeholder="Search customers... (Ctrl+N: New customer, ↑↓: Navigate, Enter: Select, Esc: Close)"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ flex: 1 }}
            onKeyDown={e => {
              // Only handle Enter key in search input, let other keys bubble up
              if (e.key === 'Enter' && selectedCustomer) {
                handleCustomerSelect(selectedCustomer);
              }
            }}
            onFocus={handleSearchFocus}
            autoFocus={!showAddForm && !showCreateGrid}
            onBlur={
              !showAddForm && !showCreateGrid
                ? () => {
                    // Only auto-focus back to search if no forms are shown
                    if (visible && searchInputRef.current) {
                      setTimeout(() => {
                        if (
                          visible &&
                          searchInputRef.current &&
                          !showAddForm &&
                          !showCreateGrid
                        ) {
                          searchInputRef.current.focus();
                        }
                      }, 10);
                    }
                  }
                : undefined
            }
            suffix={
              searchTerm && customerLoading ? (
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Searching...
                </div>
              ) : null
            }
          />
          <Button
            type={showAddForm ? 'default' : 'primary'}
            icon={<UserAddOutlined />}
            onClick={() => {
              const newState = !showAddForm;
              setShowAddForm(newState);
              if (!newState) {
                // Clear form data when switching back to search mode
                clearFormData();
              }
              // Focus will be handled by the useEffect when visible changes
            }}
            style={{ minWidth: 120 }}
          >
            {showAddForm ? 'Cancel' : 'Add New'}
          </Button>
        </Space.Compact>
      </div>

      {/* Unified Create Form - Shows when search has no results or when Add New is clicked */}
      {(showCreateGrid || showAddForm) && (
        <div
          ref={createGridRef}
          style={{
            marginBottom: 20,
            padding: 24,
            border: '2px solid #6366f1',
            borderRadius: 16,
            backgroundColor:
              'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            boxShadow:
              '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
          tabIndex={-1}
        >
          {/* Decorative background elements */}
          <div
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              opacity: 0.1,
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              opacity: 0.1,
              zIndex: 0,
            }}
          />

          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}
          >
            <Col>
              <Title
                level={4}
                style={{
                  margin: 0,
                  background:
                    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 700,
                  fontSize: '20px',
                }}
              >
                <PlusOutlined style={{ marginRight: 8, color: '#6366f1' }} />
                Create New Customer
              </Title>
              <Text
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  fontWeight: 500,
                  display: 'block',
                  marginTop: 4,
                }}
              >
                ✨ Fill in the details below to create a new customer
              </Text>
            </Col>
            <Col>
              <Space size="middle">
                <Button
                  size="middle"
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setShowCreateGrid(false);
                    setShowAddForm(false);
                    CustomerApi('GetAll');
                    clearFormData();
                  }}
                  style={{
                    border: '2px solid #e2e8f0',
                    borderRadius: 8,
                    fontWeight: 600,
                    color: '#64748b',
                    background: 'white',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    height: 40,
                    padding: '0 20px',
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="middle"
                  icon={<SaveOutlined />}
                  onClick={handleCreateCustomerFromForm}
                  loading={createLoading}
                  style={{
                    background:
                      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    height: 40,
                    padding: '0 24px',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Create & Select
                </Button>
              </Space>
            </Col>
          </Row>

          <Form
            form={form}
            layout="vertical"
            size="middle"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
                marginBottom: 20,
              }}
            >
              <Form.Item
                name="full_name"
                label={
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#374151',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <UserOutlined style={{ color: '#6366f1' }} />
                    Full Name
                  </span>
                }
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input
                  ref={firstFormInputRef}
                  name="full_name"
                  placeholder="Enter full name"
                  prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                  autoFocus={showAddForm || showCreateGrid}
                  value={newCustomerData.full_name}
                  onChange={e =>
                    handleFormFieldChange('full_name', e.target.value)
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCustomerFromForm();
                    }
                  }}
                  style={{
                    borderRadius: 10,
                    border: '2px solid #e5e7eb',
                    padding: '12px 16px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    background: 'white',
                  }}
                />
              </Form.Item>

              <Form.Item
                name="mobile"
                label={
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#374151',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <PhoneOutlined style={{ color: '#10b981' }} />
                    Mobile Number
                  </span>
                }
                rules={[
                  { required: true, message: 'Please enter mobile number' },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: 'Mobile must be 10 digits',
                  },
                ]}
              >
                <Input
                  name="mobile"
                  placeholder="Enter mobile number"
                  prefix={<PhoneOutlined style={{ color: '#9ca3af' }} />}
                  value={newCustomerData.mobile}
                  onChange={e =>
                    handleFormFieldChange('mobile', e.target.value)
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCustomerFromForm();
                    }
                  }}
                  style={{
                    borderRadius: 10,
                    border: '2px solid #e5e7eb',
                    padding: '12px 16px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    background: 'white',
                  }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#374151',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <MailOutlined style={{ color: '#f59e0b' }} />
                    Email
                  </span>
                }
                rules={[{ type: 'email', message: 'Please enter valid email' }]}
              >
                <Input
                  name="email"
                  placeholder="Enter email"
                  prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
                  value={newCustomerData.email}
                  onChange={e => handleFormFieldChange('email', e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCustomerFromForm();
                    }
                  }}
                  style={{
                    borderRadius: 10,
                    border: '2px solid #e5e7eb',
                    padding: '12px 16px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    background: 'white',
                  }}
                />
              </Form.Item>

              {/* <Form.Item
                name="customer_type"
                label={
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#374151',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Tag
                      style={{
                        background:
                          'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      TYPE
                    </Tag>
                    Customer Type
                  </span>
                }
                initialValue="regular"
              >
                <Select
                  value={newCustomerData.customer_type}
                  onChange={value =>
                    handleFormFieldChange('customer_type', value)
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCustomerFromForm();
                    }
                  }}
                  style={{
                    borderRadius: 10,
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    background: 'white',
                  }}
                >
                  <Option value="regular">Regular</Option>
                  <Option value="vip">VIP</Option>
                  <Option value="wholesale">Wholesale</Option>
                </Select>
              </Form.Item> */}
            </div>

            <Form.Item
              name="address"
              label={
                <span
                  style={{
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <HomeOutlined style={{ color: '#ef4444' }} />
                  Address
                </span>
              }
            >
              <Input.TextArea
                name="address"
                placeholder="Enter address"
                rows={3}
                value={newCustomerData.address}
                onChange={e => handleFormFieldChange('address', e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // If it's the last field, create the customer
                    handleCreateCustomerFromForm();
                  }
                }}
                style={{
                  borderRadius: 10,
                  border: '2px solid #e5e7eb',
                  padding: '12px 16px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  background: 'white',
                  resize: 'none',
                }}
              />
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
              {searchTerm
                ? 'No customers found matching your search.'
                : 'No customers available.'}
            </Text>
            {searchTerm && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  Press Ctrl+N to create a new customer instantly
                </Text>
              </div>
            )}
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

// Memoize the component to prevent unnecessary re-renders
const CustomerSelectionModal = React.memo(CustomerSelectionModalComponent);
export default CustomerSelectionModal;
