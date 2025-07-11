import React, { useEffect, useState } from 'react';
import { Space, Tag, Tooltip, Typography, Row, Input } from 'antd';
import { useDynamicSelector } from '../../services/redux';
import { useApiActions } from '../../services/api/useApiActions';
import { DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import GlobalTable from '../../components/antd/GlobalTable';
const { Text } = Typography;

const BranchStock: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const BranchStock = getEntityApi('BranchStock');
  const { items: BranchStockList, loading: stockAuditLoading } =
    useDynamicSelector(BranchStock.getIdentifier('GetAll'));

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");

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
  ];

  useEffect(() => {
    BranchStock('GetAll', {
      pageNumber: pagination.current,
      pageLimit: pagination.pageSize,
      searchString: searchText,
    });
  }, [BranchStock]);

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h1>{'Branch Stocks'}</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Input
            placeholder={`Search ${'Products'}`}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
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
    </>
  );
};

export default BranchStock;
