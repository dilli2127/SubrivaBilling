import React, { useState, useEffect } from 'react';
import { Typography, message } from 'antd';
import EditableDataGrid, { EditableColumn } from '../../components/common/EditableDataGrid';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux';
import { useHandleApiResponse } from '../../components/common/useHandleApiResponse';

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
  const columns: EditableColumn[] = [
    {
      key: 'full_name',
      name: 'Full Name',
      field: 'full_name',
      type: 'text',
      required: true,
      width: 200,
      validation: (value: string) => {
        if (!value || value.trim().length < 2) {
          return 'Full name must be at least 2 characters';
        }
        return null;
      }
    },
    {
      key: 'email',
      name: 'Email Address',
      field: 'email',
      type: 'text',
      width: 220,
      validation: (value: string) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      }
    },
    {
      key: 'mobile',
      name: 'Mobile Number',
      field: 'mobile',
      type: 'text',
      required: true,
      width: 150,
      validation: (value: string) => {
        if (!value || !/^[0-9]{10}$/.test(value)) {
          return 'Mobile number must be exactly 10 digits';
        }
        return null;
      }
    },
    {
      key: 'address',
      name: 'Address',
      field: 'address',
      type: 'text',
      width: 250
    },
    {
      key: 'customer_type',
      name: 'Customer Type',
      field: 'customer_type',
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
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24, color: '#1890ff' }}>
        Customer Management
      </Title>
      
      <div style={{ 
        background: '#fff', 
        padding: 16, 
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <EditableDataGrid
          columns={columns}
          data={customers}
          onSave={handleSave}
          onAdd={handleAdd}
          onDelete={handleDelete}
          height={500}
          loading={loading}
          allowAdd={true}
          allowDelete={true}
          allowEdit={true}
        />
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        <strong>Tips:</strong>
        <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
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