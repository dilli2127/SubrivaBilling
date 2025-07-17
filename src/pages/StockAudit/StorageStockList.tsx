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
      title: 'Rack Name',
      dataIndex: ['RackItem', 'name'],
      key: 'rack_name',
      render: (_: any, record: any) => record.RackItem?.name || '-',
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
      title: 'Invoice ID',
      dataIndex: ['StockAuditItem', 'invoice_id'],
      key: 'invoice_id',
      render: (_: any, record: any) => record.StockAuditItem?.invoice_id || '-',
    },
    {
      title: 'Product Qty',
      dataIndex: ['StockAuditItem', 'quantity'],
      key: 'product_quantity',
      render: (_: any, record: any) => record.StockAuditItem?.quantity || '-',
    },
    {
      title: 'Batch No',
      dataIndex: ['StockAuditItem', 'batch_no'],
      key: 'batch_no',
      render: (_: any, record: any) => record.StockAuditItem?.batch_no || '-',
    },
    {
      title: 'MFG Date',
      dataIndex: ['StockAuditItem', 'mfg_date'],
      key: 'mfg_date',
      render: (_: any, record: any) =>
        record.StockAuditItem?.mfg_date
          ? new Date(record.StockAuditItem.mfg_date).toLocaleDateString()
          : '-',
    },
    {
      title: 'Expiry Date',
      dataIndex: ['StockAuditItem', 'expiry_date'],
      key: 'expiry_date',
      render: (_: any, record: any) =>
        record.StockAuditItem?.expiry_date
          ? new Date(record.StockAuditItem.expiry_date).toLocaleDateString()
          : '-',
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
          pageLimit={10}
        />
      </Spin>
    </div>
  );
};

export default StorageStockList; 