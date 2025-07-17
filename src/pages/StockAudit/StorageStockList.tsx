import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux';
import GlobalTable from '../../components/antd/GlobalTable';

const StorageStockList: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const StockStorageApi = getEntityApi('StockStorage');

  const { items: storageList = [], loading } = useDynamicSelector(
    StockStorageApi.getIdentifier('GetAll')
  );

  useEffect(() => {
    StockStorageApi('GetAll');
  }, [StockStorageApi]);

  const columns = [
    {
      title: 'Rack',
      dataIndex: 'rack_id',
      key: 'rack_id',
      render: (rack: any) => rack?.name || rack || '-',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Loose Quantity',
      dataIndex: 'loose_quantity',
      key: 'loose_quantity',
    },
    {
      title: 'Stock Audit ID',
      dataIndex: 'stock_audit_id',
      key: 'stock_audit_id',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
  ];

  // Ensure dataSource is always an array of objects
  const dataSource = Array.isArray(storageList.result)
    ? storageList.result.filter((item: any) => typeof item === 'object' && item !== null)
    : Array.isArray(storageList)
      ? storageList.filter((item: any) => typeof item === 'object' && item !== null)
      : [];

  return (
    <div style={{ padding: 24 }}>
      <h2>Storage Stock List</h2>
      <Spin spinning={loading}>
        <GlobalTable
          rowKeyField="_id"
          columns={columns}
          data={dataSource}
          pageLimit={20}
        />
      </Spin>
    </div>
  );
};

export default StorageStockList; 