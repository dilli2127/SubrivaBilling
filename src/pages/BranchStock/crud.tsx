import React, { useEffect, useState } from 'react';
import { Space, Tag, Tooltip, Typography, Row, Input, Button } from 'antd';
import { useDynamicSelector } from '../../services/redux';
import { useApiActions } from '../../services/api/useApiActions';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import GlobalTable from '../../components/antd/GlobalTable';
import StorageAllocateDrawer from '../StockAudit/StorageAllocateDrawer';
import { useHandleApiResponse } from '../../components/common/useHandleApiResponse';
const { Text } = Typography;

const BranchStock: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const BranchStock = getEntityApi('BranchStock');
  const StockStorageApi = getEntityApi('StockStorage');
  const RackApi = getEntityApi('Rack');

  const { items: BranchStockList, loading: stockAuditLoading } =
    useDynamicSelector(BranchStock.getIdentifier('GetAll'));
  const { items: rackList, loading: rackLoading } = useDynamicSelector(
    RackApi.getIdentifier('GetAll')
  );
  const { loading: createLoading } = useDynamicSelector(
    StockStorageApi.getIdentifier('Create')
  );

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
    BranchStock('GetAll', {
      pageNumber,
      pageLimit,
      searchString: searchText,
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 }); // Reset to first page on search
    BranchStock('GetAll', {
      pageNumber: 1,
      pageLimit: pagination.pageSize,
      searchString: value,
    });
  };

  // Handler to open storage allocate drawer
  const handleStorageAllocate = (record: any) => {
    setStorageAllocateRecord(record);
    setStorageAllocateDrawerOpen(true);
  };

  // Handler for storage allocate submit
  const handleStorageAllocateSubmit = async (values: any) => {
    await StockStorageApi('Create', {
      ...values,
      stock_audit_id: storageAllocateRecord?._id,
    });
    setStorageAllocateDrawerOpen(false);
    setStorageAllocateRecord(null);
  };

  useHandleApiResponse({
    action: 'create',
    title: 'Storage Allocate',
    identifier: StockStorageApi.getIdentifier('Create'),
    entityApi: BranchStock,
  });

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
            <Tooltip title="Storage Allocate">
              <Button
                type="primary"
                size="small"
                icon={<InboxOutlined />}
                onClick={() => handleStorageAllocate(record)}
                disabled={isOutOfStock}
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

  useEffect(() => {
    BranchStock('GetAll', {
      pageNumber: pagination.current,
      pageLimit: pagination.pageSize,
      searchString: searchText,
    });
    RackApi('GetAll');
  }, [BranchStock, RackApi]);

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
          Array.isArray(BranchStockList?.result) ? BranchStockList.result : []
        }
        rowKey="_id"
        loading={stockAuditLoading}
        totalCount={BranchStockList?.pagination?.totalCount || 0}
        pageLimit={BranchStockList?.pagination?.pageLimit || 10}
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
