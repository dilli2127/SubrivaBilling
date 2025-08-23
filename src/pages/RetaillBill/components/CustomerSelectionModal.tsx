import React, { useState, useEffect, useRef } from 'react';
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
  const [form] = Form.useForm();
  const searchInputRef = useRef<any>(null);

  // Load customers on mount
  useEffect(() => {
    if (visible) {
      CustomerApi('GetAll');
      // Focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  // Filter customers based on search term
  const filteredCustomers = customerList?.result?.filter((customer: Customer) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(searchLower) ||
      customer.mobile.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.address.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onSelect(customer);
    // Close the modal after selection
    setTimeout(() => {
      onCancel();
    }, 100);
  };

  // Handle new customer creation
  const handleCreateCustomer = async (values: any) => {
    try {
      const response: any = await CustomerApi('Create', values);
      if (response?.statusCode === 200) {
        message.success('Customer created successfully!');
        setShowAddForm(false);
        form.resetFields();
        // Refresh customer list
        CustomerApi('GetAll');
        // Select the newly created customer
        if (response.result) {
          handleCustomerSelect(response.result);
        }
      }
    } catch (error) {
      message.error('Failed to create customer');
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && selectedCustomer) {
      handleCustomerSelect(selectedCustomer);
    }
  };

  // Get customer type color
  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'vip': return 'gold';
      case 'wholesale': return 'blue';
      default: return 'green';
    }
  };

  // Table columns definition
  const columns = [
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
          onClick={() => setSelectedCustomer(record)}
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
   ];

  return (
    <Modal
      title="Select Customer"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <div 
        style={{ marginBottom: 16 }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
         <Space.Compact style={{ width: '100%' }}>
           <Input
             ref={searchInputRef}
             placeholder="Search customers by name, mobile, email, or address..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             prefix={<SearchOutlined />}
             style={{ flex: 1 }}
             onKeyDown={handleKeyDown}
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
                           onRow={(record) => ({
                onClick: () => {
                  setSelectedCustomer(record);
                  // Auto-close modal after row click
                  setTimeout(() => {
                    handleCustomerSelect(record);
                  }, 100);
                },
                style: {
                  cursor: 'pointer',
                  backgroundColor: selectedCustomer?._id === record._id ? '#f0f8ff' : 'white',
                  border: selectedCustomer?._id === record._id ? '2px solid #1890ff' : '1px solid #f0f0f0',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                },
                onMouseEnter: (e) => {
                  if (selectedCustomer?._id !== record._id) {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }
                },
                onMouseLeave: (e) => {
                  if (selectedCustomer?._id !== record._id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                },
              })}
           />
         )}
      </div>
    </Modal>
  );
};

export default CustomerSelectionModal; 