import React, { useEffect, useState } from 'react';
import { Form, message } from 'antd';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { stockAuditColumns } from './columns';
import { getStockAuditFormItems } from './formItems';
import AllocateDrawer from './AllocateDrawer';
import RevertDrawer from './RevertDrawer';
import StockOutDrawer from './StockOutDrawer';
import StorageAllocateDrawer from './StorageAllocateDrawer';
import { useHandleApiResponse } from '../../components/common/useHandleApiResponse';

const StockAuditCrud: React.FC = () => {
  const [form] = Form.useForm();
  const [allocateDrawerOpen, setAllocateDrawerOpen] = useState(false);
  const [allocateRecord, setAllocateRecord] = useState<any>(null);
  const [revertDrawerOpen, setRevertDrawerOpen] = useState(false);
  const [revertRecord, setRevertRecord] = useState<any>(null);
  const [stockoutDrawerOpen, setStockoutDrawerOpen] = useState(false);
  const [stockoutRecord, setStockoutRecord] = useState<any>(null);
  const [storageAllocateDrawerOpen, setStorageAllocateDrawerOpen] = useState(false);
  const [storageAllocateRecord, setStorageAllocateRecord] = useState<any>(null);

  const { getEntityApi, StockRevertFromBranch } = useApiActions();
  const ProductsApi = getEntityApi('Product');
  const VendorApi = getEntityApi('Vendor');
  const WarehouseApi = getEntityApi('Warehouse');
  const BranchApi = getEntityApi('Braches');
  const BranchStock = getEntityApi('BranchStock');
  const StockAudit = getEntityApi('StockAudit');
  const StockOut = getEntityApi('StockOut');
  const RackApi = getEntityApi('Rack');
  const StockStorageApi = getEntityApi('StockStorage');

  const { items: productList, loading } = useDynamicSelector(
    ProductsApi.getIdentifier('GetAll')
  );
  const { items: vendorList, loading: vendorloading } = useDynamicSelector(
    VendorApi.getIdentifier('GetAll')
  );
  const { items: wareHouseList, loading: wareHouseLoading } =
    useDynamicSelector(WarehouseApi.getIdentifier('GetAll'));
  const { items: branchList, loading: branchLoading } = useDynamicSelector(
    BranchApi.getIdentifier('GetAll')
  );
  const { items: rackList, loading: rackLoading } = useDynamicSelector(
    RackApi.getIdentifier('GetAll')
  );
  const { loading: createLoading } = useDynamicSelector(
    BranchStock.getIdentifier('Create')
  );
  const { loading: stockoutLoading } = useDynamicSelector(
    StockOut.getIdentifier('Create')
  );
  const { loading: revertLoading } = useDynamicSelector(
    StockRevertFromBranch.getIdentifier('RevertStock')
  );

  useEffect(() => {
    const qty = form.getFieldValue('quantity');
    const price = form.getFieldValue('buy_price');
    if (qty && price) {
      form.setFieldsValue({ total_cost: qty * price });
    }
  }, [form, form.getFieldValue('quantity'), form.getFieldValue('buy_price')]);

  useEffect(() => {
    ProductsApi('GetAll');
    VendorApi('GetAll');
    WarehouseApi('GetAll');
    BranchApi('GetAll');
    RackApi('GetAll');
  }, [ProductsApi, VendorApi, WarehouseApi, BranchApi, RackApi]);

  useHandleApiResponse({
    action: 'create',
    title: 'Stock allocation',
    identifier: BranchStock.getIdentifier('Create'),
    entityApi: StockAudit,
  });
  useHandleApiResponse({
    action: 'update',
    title: 'Stock updated',
    identifier: StockRevertFromBranch.getIdentifier('RevertStock'),
    entityApi: StockAudit,
  });
  useHandleApiResponse({
    action: 'create',
    title: 'Stock Out',
    identifier: StockOut.getIdentifier('Create'),
    entityApi: StockAudit,
  });
  useHandleApiResponse({
    action: 'create',
    title: 'Storage Allocate',
    identifier: StockStorageApi.getIdentifier('Create'),
    entityApi: StockAudit,
  });

  // Handler to open allocate drawer
  const handleAllocate = (record: any) => {
    setAllocateRecord(record);
    setAllocateDrawerOpen(true);
  };

  const handleAllocateSubmit = async (values: any) => {
    await BranchStock('Create', {
      ...values,
      stock_audit_id: allocateRecord._id,
      product: allocateRecord.ProductItem?._id,
      batch_no: allocateRecord.batch_no,
      mfg_date: allocateRecord.mfg_date,
      mrp:allocateRecord.mrp,
      expiry_date: allocateRecord.expiry_date,
      invoice_id:allocateRecord.invoice_id,
      sell_price:allocateRecord.sell_price,
      available_loose_quantity: allocateRecord.available_loose_quantity,
      available_quantity: allocateRecord.available_quantity,
    });
    setAllocateDrawerOpen(false);
    setAllocateRecord(null);
  };

  // Handler to open revert drawer
  const handleRevert = (record: any) => {
    setRevertRecord(record);
    setRevertDrawerOpen(true);
  };

  // Handler for revert submit
  const handleRevertSubmit = async (values: any) => {
    await StockRevertFromBranch('RevertStock', {
      ...values,
      stock_audit_id: revertRecord._id,
    });
    setRevertDrawerOpen(false);
    setRevertRecord(null);
  };

  // Handler to open stockout drawer
  const handleStockout = (record: any) => {
    setStockoutRecord(record);
    setStockoutDrawerOpen(true);
  };

  // Handler for stockout submit
  const handleStockoutSubmit = async (values: any) => {
    await StockOut('Create', {
      ...values,
      stock_audit_id: stockoutRecord._id,
    });
    setStockoutDrawerOpen(false);
    setStockoutRecord(null);
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

  const stockAuditConfig = {
    title: 'Stock Audit',
    columns: stockAuditColumns({
      onAllocate: handleAllocate,
      onRevert: handleRevert,
      onStockout: handleStockout,
      onStorageAllocate: handleStorageAllocate,
    }),
    formItems: getStockAuditFormItems(
      productList,
      vendorList,
      wareHouseList,
      loading,
      vendorloading,
      wareHouseLoading
    ),
    apiRoutes: getEntityApiRoutes('StockAudit'),
    formColumns: 3,
    drawerWidth: 1200,
  };

  return (
    <>
      <GenericCrudPage config={stockAuditConfig} />
      <AllocateDrawer
        open={allocateDrawerOpen}
        onClose={() => setAllocateDrawerOpen(false)}
        onSubmit={handleAllocateSubmit}
        record={allocateRecord}
        branchList={branchList}
        branchLoading={branchLoading}
        createLoading={createLoading}
      />
      <RevertDrawer
        open={revertDrawerOpen}
        onClose={() => setRevertDrawerOpen(false)}
        onSubmit={handleRevertSubmit}
        record={revertRecord}
        branchList={branchList}
        branchLoading={branchLoading}
        loading={revertLoading}
      />
      <StockOutDrawer
        open={stockoutDrawerOpen}
        onClose={() => setStockoutDrawerOpen(false)}
        onSubmit={handleStockoutSubmit}
        record={stockoutRecord}
        loading={stockoutLoading}
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

export default StockAuditCrud;
