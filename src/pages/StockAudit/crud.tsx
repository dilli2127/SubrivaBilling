import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Form, message } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { stockAuditColumns } from './columns';
import { getStockAuditFormItems } from './formItems';
import AllocateDrawer from './AllocateDrawer';
import RevertDrawer from './RevertDrawer';
import StockOutDrawer from './StockOutDrawer';
import StorageAllocateDrawer from './StorageAllocateDrawer';
import { apiSlice } from '../../services/redux/api/apiSlice';
import { useDispatch } from 'react-redux';

const StockAuditCrud: React.FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [allocateDrawerOpen, setAllocateDrawerOpen] = useState(false);
  const [allocateRecord, setAllocateRecord] = useState<any>(null);
  const [revertDrawerOpen, setRevertDrawerOpen] = useState(false);
  const [revertRecord, setRevertRecord] = useState<any>(null);
  const [stockoutDrawerOpen, setStockoutDrawerOpen] = useState(false);
  const [stockoutRecord, setStockoutRecord] = useState<any>(null);
  const [storageAllocateDrawerOpen, setStorageAllocateDrawerOpen] = useState(false);
  const [storageAllocateRecord, setStorageAllocateRecord] = useState<any>(null);

  // Use RTK Query for fetching related data (read operations)
  const { data: productData, isLoading: loading } = apiSlice.useGetProductQuery({});
  const { data: vendorData, isLoading: vendorloading } = apiSlice.useGetVendorQuery({});
  const { data: wareHouseData, isLoading: wareHouseLoading } = apiSlice.useGetWarehouseQuery({});
  const { data: branchData, isLoading: branchLoading } = apiSlice.useGetBranchesQuery({});
  const { data: rackData, isLoading: rackLoading } = apiSlice.useGetRackQuery({});

  // Memoize data extraction to prevent unnecessary re-renders
  const productList = useMemo(() => (productData as any)?.result || [], [productData]);
  const vendorList = useMemo(() => (vendorData as any)?.result || [], [vendorData]);
  const wareHouseList = useMemo(() => (wareHouseData as any)?.result || [], [wareHouseData]);
  const branchList = useMemo(() => (branchData as any)?.result || [], [branchData]);
  const rackList = useMemo(() => (rackData as any)?.result || [], [rackData]);

  // Use RTK Query mutations
  const [createBranchStock, { isLoading: createLoading }] = apiSlice.useCreateBranchStockMutation();
  const [createStockOut, { isLoading: stockoutLoading }] = apiSlice.useCreateStockOutMutation();
  const [createStockStorage, { isLoading: storageLoading }] = apiSlice.useCreateStockStorageMutation();

  // Use RTK Query mutation for revert stock
  const [revertStockFromBranch, { isLoading: revertLoading }] = apiSlice.useRevertStockFromBranchMutation();

  // Memoize form field watchers to prevent unnecessary re-renders
  const quantity = form.getFieldValue('quantity');
  const buyPrice = form.getFieldValue('buy_price');
  
  useEffect(() => {
    if (quantity && buyPrice) {
      form.setFieldsValue({ total_cost: quantity * buyPrice });
    }
  }, [quantity, buyPrice, form]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleAllocate = useCallback((record: any) => {
    setAllocateRecord(record);
    setAllocateDrawerOpen(true);
  }, []);

  const handleAllocateSubmit = useCallback(async (values: any) => {
    try {
      await createBranchStock({
        ...values,
        stock_audit_id: allocateRecord._id,
        product: allocateRecord.ProductItem?._id,
        batch_no: allocateRecord.batch_no,
        mfg_date: allocateRecord.mfg_date,
        mrp: allocateRecord.mrp,
        expiry_date: allocateRecord.expiry_date,
        invoice_id: allocateRecord.invoice_id,
        sell_price: allocateRecord.sell_price,
      }).unwrap();
      message.success('Stock allocated successfully');
      // Refresh StockAudit list after successful allocation
      dispatch(apiSlice.util.invalidateTags(['StockAudit'] as any));
      setAllocateDrawerOpen(false);
      setAllocateRecord(null);
    } catch (error) {
      message.error('Failed to allocate stock');
    }
  }, [allocateRecord, createBranchStock]);

  const handleRevert = useCallback((record: any) => {
    setRevertRecord(record);
    setRevertDrawerOpen(true);
  }, []);

  const handleRevertSubmit = useCallback(async (values: any) => {
    try {
      await revertStockFromBranch({
        ...values,
        stock_audit_id: revertRecord._id,
      }).unwrap();
      message.success('Stock reverted successfully');
      // Refresh StockAudit list after successful revert
      dispatch(apiSlice.util.invalidateTags(['StockAudit'] as any));
      setRevertDrawerOpen(false);
      setRevertRecord(null);
    } catch (error) {
      message.error('Failed to revert stock');
    }
  }, [revertRecord, revertStockFromBranch]);

  const handleStockout = useCallback((record: any) => {
    setStockoutRecord(record);
    setStockoutDrawerOpen(true);
  }, []);

  const handleStockoutSubmit = useCallback(async (values: any) => {
    try {
      await createStockOut({
        ...values,
        stock_audit_id: stockoutRecord._id,
      }).unwrap();
      message.success('Stock out created successfully');
      // Refresh StockAudit list after successful stock out
      dispatch(apiSlice.util.invalidateTags(['StockAudit'] as any));
      setStockoutDrawerOpen(false);
      setStockoutRecord(null);
    } catch (error) {
      message.error('Failed to create stock out');
    }
  }, [stockoutRecord, createStockOut]);

  const handleStorageAllocate = useCallback((record: any) => {
    setStorageAllocateRecord(record);
    setStorageAllocateDrawerOpen(true);
  }, []);

  const handleStorageAllocateSubmit = useCallback(async (values: any) => {
    try {
      const res: any = await createStockStorage({
        ...values,
        stock_audit_id: storageAllocateRecord?._id,
      }).unwrap();
      if (res && typeof res === 'object' && 'statusCode' in res && res.statusCode !== 200) {
        throw { data: res };
      }
      message.success('Storage allocated successfully');
      // Refresh StockAudit list after successful storage allocation
      dispatch(apiSlice.util.invalidateTags(['StockAudit'] as any));
      setStorageAllocateDrawerOpen(false);
      setStorageAllocateRecord(null);
    } catch (error: any) {
      const backendMessage = error?.data?.message || error?.error || 'Failed to allocate storage';
      message.error(backendMessage);
    }
  }, [storageAllocateRecord, createStockStorage]);

  // Memoize config to prevent unnecessary re-renders
  const stockAuditConfig = useMemo(() => ({
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
    entityName: 'StockAudit',
    formColumns: 3,
    drawerWidth: 1200,
  }), [
    handleAllocate,
    handleRevert,
    handleStockout,
    handleStorageAllocate,
    productList,
    vendorList,
    wareHouseList,
    loading,
    vendorloading,
    wareHouseLoading
  ]);

  return (
    <>
      <GenericCrudPage 
        config={stockAuditConfig}
        onValuesChange={(_changed: any, all: any, formInstance?: any) => {
          const qty = Number(all?.quantity || 0);
          const price = Number(all?.buy_price || 0);
          const updates: any = {};
          if (!Number.isNaN(qty)) {
            updates.available_quantity = qty; // Available Quantity mirrors Quantity
          }
          if (!Number.isNaN(qty) || !Number.isNaN(price)) {
            updates.total_cost = (qty || 0) * (price || 0);
          }
          if (formInstance && Object.keys(updates).length > 0) {
            formInstance.setFieldsValue(updates);
          }
        }}
      />
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
        createLoading={storageLoading}
      />
    </>
  );
};

export default StockAuditCrud;
