import React, { useState } from 'react';
import { Space, Tag, Tooltip, Typography, Row, Input, Button, message } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import GlobalTable from '../../components/antd/GlobalTable';
import StorageAllocateDrawer from '../StockAudit/StorageAllocateDrawer';
import { apiSlice } from '../../services/redux/api/apiSlice';
const { Text } = Typography;

const BranchStock: React.FC = () => {
  // Use RTK Query for fetching data - using dynamic hooks
  const { data: branchStockData, isLoading: stockAuditLoading } = apiSlice.useGetBranchStockQuery({});
  const { data: rackData, isLoading: rackLoading } = apiSlice.useGetRackQuery({});
  
  const BranchStockList = (branchStockData as any)?.result || [];
  const rackList = (rackData as any)?.result || [];

  // Use RTK Query mutations - using dynamic hooks
  const [createStockStorage, { isLoading: createLoading }] = apiSlice.useCreateStockStorageMutation();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState('');
  const [storageAllocateDrawerOpen, setStorageAllocateDrawerOpen] =
    useState(false);
  const [storageAllocateRecord, setStorageAllocateRecord] = useState<any>(null);

  const handlePaginationChange = (pageNumber: number, pageLimit: number) => {
    setPagination({ current: pageNumber, pageSize: pageLimit });
    // RTK Query handles pagination automatically through query parameters
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 }); // Reset to first page on search
    // RTK Query handles search automatically through query parameters
  };

  // Handler to open storage allocate drawer
  const handleStorageAllocate = (record: any) => {
    setStorageAllocateRecord(record);
    setStorageAllocateDrawerOpen(true);
  };

  // Handler for storage allocate submit
  const handleStorageAllocateSubmit = async (values: any) => {
    try {
      const res: any = await createStockStorage({
        ...values,
        stock_audit_id: storageAllocateRecord?._id,
      }).unwrap();
      if (res && typeof res === 'object' && 'statusCode' in res && res.statusCode !== 200) {
        throw { data: res };
      }
      message.success('Storage allocated successfully');
      setStorageAllocateDrawerOpen(false);
      setStorageAllocateRecord(null);
    } catch (error: any) {
      const backendMessage = error?.data?.message || error?.error || 'Failed to allocate storage';
      message.error(backendMessage);
    }
  };

  const columns = [
    {
      title: 'Invoice',
      dataIndex: 'invoice_id',
      key: 'invoice_id',
      render: (text: string) => (
        <Tooltip title="Invoice ID">
          <Tag color="blue">{text}</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: any) =>
        [
          record.ProductItem?.name,
          record.ProductItem?.VariantItem?.variant_name,
          record?.batch_no,
        ]
          .filter(Boolean)
          .join(' - ') || 'N/A',
    },
    {
      title: 'Added Qty',
      dataIndex: 'added_quantity',
      key: 'added_quantity',
      render: (qty: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ShoppingCartOutlined style={{ color: '#1890ff' }} />
          <Text strong>{qty}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Pack(s)
          </Text>
        </div>
      ),
    },
    {
      title: 'Available',
      key: 'quantity',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text>
            <strong>{record.available_quantity}</strong> Pack(s)
          </Text>
          <Text type="secondary">
            + {record.available_loose_quantity} Loose
          </Text>
        </Space>
      ),
    },
    {
      title: 'Sell Price',
      dataIndex: 'sell_price',
      key: 'sell_price',
      render: (price: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DollarOutlined style={{ color: '#faad14' }} />
          <Text>₹ {parseFloat(price).toFixed(2)}</Text>
        </div>
      ),
    },
    {
      title: 'A/Q to Rack',
      dataIndex: 'rack_available_to_allocate',
      key: 'rack_available_to_allocate',
      render: (qty: number) => (
        <Tag color={qty > 0 ? 'green' : 'red'}>{qty}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => {
        const availableQty = record.available_quantity || 0;
        const isOutOfStock = availableQty === 0;

        return (
          <Space size="small">
            <Tooltip title={(record?.rack_available_to_allocate || 0) === 0 ? 'Rack storage quantity not available' : 'Storage Allocate'}>
              <Button
                type="primary"
                size="small"
                icon={<InboxOutlined />}
                onClick={() => handleStorageAllocate(record)}
                disabled={isOutOfStock || (record?.rack_available_to_allocate || 0) === 0}
                style={{
                  fontSize: '10px',
                  height: '24px',
                  padding: '0 6px',
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                }}
              >
                Storage
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h1>{'Branch Stocks'}</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Input
            placeholder={`Search ${'Products'}`}
            value={searchText}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
      </Row>
      <GlobalTable
        columns={[...columns]}
        data={
          Array.isArray(BranchStockList) ? BranchStockList : []
        }
        rowKey="_id"
        loading={stockAuditLoading}
        totalCount={(branchStockData as any)?.pagination?.totalCount || 0}
        pageLimit={(branchStockData as any)?.pagination?.pageLimit || 10}
        onPaginationChange={handlePaginationChange}
      />
      <StorageAllocateDrawer
        open={storageAllocateDrawerOpen}
        onClose={() => setStorageAllocateDrawerOpen(false)}
        onSubmit={handleStorageAllocateSubmit}
        record={storageAllocateRecord}
        rackList={rackList}
        rackLoading={rackLoading}
        createLoading={createLoading}
      />
    </>
  );
};

export default BranchStock;
