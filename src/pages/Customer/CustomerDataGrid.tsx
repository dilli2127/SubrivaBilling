import React, { useState, useEffect } from 'react';
import { Typography, message } from 'antd';
import AntdEditableTable, { AntdEditableColumn } from '../../components/common/AntdEditableTable';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux';
import { useHandleApiResponse } from '../../components/common/useHandleApiResponse';
import './CustomerDataGrid.css';

const { Title } = Typography;

interface Customer {
  _id?: string;
  full_name: string;
  email: string;
  mobile: string;
  address: string;
  customer_type: 'regular' | 'vip' | 'wholesale';
}

const CustomerDataGrid: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const CustomerApi = getEntityApi('Customer');
  
  const { items: customerList, loading } = useDynamicSelector(CustomerApi.getIdentifier('GetAll'));
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load customers on component mount
  useEffect(() => {
    CustomerApi('GetAll');
  }, []);

  // Update local state when API data changes
  useEffect(() => {
    if (customerList?.result) {
      setCustomers(customerList.result.map((customer: any) => ({
        _id: customer._id,
        full_name: customer.full_name || '',
        email: customer.email || '',
        mobile: customer.mobile || '',
        address: customer.address || '',
        customer_type: customer.customer_type || 'regular'
      })));
    }
  }, [customerList]);

  // Define columns for the data grid
  const columns: AntdEditableColumn[] = [
    {
      key: 'full_name',
      title: 'Full Name',
      dataIndex: 'full_name',
      type: 'text',
      required: true,
      width: 200,
      validation: (value: string) => {
        if (!value || value.trim().length < 2) {
          return 'Full name must be at least 2 characters';
        }
        return undefined;
      }
    },
    {
      key: 'email',
      title: 'Email Address',
      dataIndex: 'email',
      type: 'text',
      width: 220,
      validation: (value: string) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return undefined;
      }
    },
    {
      key: 'mobile',
      title: 'Mobile Number',
      dataIndex: 'mobile',
      type: 'text',
      required: true,
      width: 150,
      validation: (value: string) => {
        if (!value || !/^[0-9]{10}$/.test(value)) {
          return 'Mobile number must be exactly 10 digits';
        }
        return undefined;
      }
    },
    {
      key: 'address',
      title: 'Address',
      dataIndex: 'address',
      type: 'text',
      width: 250
    },
    {
      key: 'customer_type',
      title: 'Customer Type',
      dataIndex: 'customer_type',
      type: 'select',
      required: true,
      width: 150,
      options: [
        { label: 'Regular', value: 'regular' },
        { label: 'VIP', value: 'vip' },
        { label: 'Wholesale', value: 'wholesale' }
      ]
    }
  ];

  // Handle saving customers
  const handleSave = async (updatedCustomers: Customer[]) => {
    try {
      const promises = updatedCustomers.map(customer => {
        if (customer._id) {
          // Update existing customer
          return CustomerApi('Update', {
            full_name: customer.full_name,
            email: customer.email,
            mobile: customer.mobile,
            address: customer.address,
            customer_type: customer.customer_type
          }, customer._id);
        } else {
          // Create new customer
          return CustomerApi('Create', {
            full_name: customer.full_name,
            email: customer.email,
            mobile: customer.mobile,
            address: customer.address,
            customer_type: customer.customer_type
          });
        }
      });

      await Promise.all(promises);
      message.success('Customers saved successfully!');
      
      // Refresh the customer list
      setTimeout(() => {
        CustomerApi('GetAll');
      }, 500);
      
    } catch (error) {
      console.error('Error saving customers:', error);
      message.error('Failed to save customers');
    }
  };

  // Handle adding new customer
  const handleAdd = () => {
    const newCustomer: Customer = {
      full_name: '',
      email: '',
      mobile: '',
      address: '',
      customer_type: 'regular'
    };
    setCustomers([...customers, newCustomer]);
  };

  // Handle deleting customers
  const handleDelete = async (indices: number[]) => {
    try {
      const customersToDelete = indices
        .map(index => customers[index])
        .filter(customer => customer._id); // Only delete customers with IDs (existing ones)

      const promises = customersToDelete.map(customer => 
        CustomerApi('Delete', {}, customer._id)
      );

      await Promise.all(promises);
      
      // Remove from local state
      const updatedCustomers = customers.filter((_, index) => !indices.includes(index));
      setCustomers(updatedCustomers);
      
      message.success(`${indices.length} customer(s) deleted successfully!`);
    } catch (error) {
      console.error('Error deleting customers:', error);
      message.error('Failed to delete customers');
    }
  };

  // Handle API responses
  useHandleApiResponse({
    action: 'create',
    title: 'Customer',
    identifier: CustomerApi.getIdentifier('Create'),
    entityApi: CustomerApi
  });

  useHandleApiResponse({
    action: 'update',
    title: 'Customer',
    identifier: CustomerApi.getIdentifier('Update'),
    entityApi: CustomerApi
  });

  useHandleApiResponse({
    action: 'delete',
    title: 'Customer',
    identifier: CustomerApi.getIdentifier('Delete'),
    entityApi: CustomerApi
  });

  return (
    <div className="customer-data-grid">
      <Title level={2} className="customer-data-grid-title">
        Customer Management
      </Title>
      
      <div className="customer-data-grid-container">
        <AntdEditableTable
          columns={columns}
          dataSource={customers.map((customer, index) => ({ ...customer, key: customer._id || index.toString() }))}
          onSave={handleSave}
          onAdd={handleAdd}
          onDelete={handleDelete}
          loading={loading}
          allowAdd={true}
          allowDelete={true}
          size="middle"
          rowKey="key"
        />
      </div>

      <div className="customer-data-grid-tips">
        <strong>Tips:</strong>
        <ul>
          <li>Use Tab/Shift+Tab to navigate between cells</li>
          <li>Press Enter to edit a cell, Escape to cancel editing</li>
          <li>Ctrl+N to add new customer, Ctrl+S to save all changes</li>
          <li>Select rows and press Delete or Ctrl+D to delete customers</li>
          <li>Double-click any cell to start editing</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomerDataGrid; 