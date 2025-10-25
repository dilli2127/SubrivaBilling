import React, { useEffect, useState } from 'react';
import { Form, message } from 'antd';
import { useApiActions } from '../../services/api/useApiActions';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { stockAuditColumns } from './columns';
import { getStockAuditFormItems } from './formItems';
import AllocateDrawer from './AllocateDrawer';
import RevertDrawer from './RevertDrawer';
import StockOutDrawer from './StockOutDrawer';
import StorageAllocateDrawer from './StorageAllocateDrawer';
import { useHandleApiResponse } from '../../components/common/useHandleApiResponse';
import { useDynamicSelector } from '../../services/redux';
import { apiSlice } from '../../services/redux/api/apiSlice';

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

  // Use RTK Query for fetching related data (read operations)
  const { data: productData, isLoading: loading } = apiSlice.useGetProductQuery({});
  const { data: vendorData, isLoading: vendorloading } = apiSlice.useGetVendorQuery({});
  const { data: wareHouseData, isLoading: wareHouseLoading } = apiSlice.useGetWarehouseQuery({});
  const { data: branchData, isLoading: branchLoading } = apiSlice.useGetBranchQuery({});
  const { data: rackData, isLoading: rackLoading } = apiSlice.useGetRackQuery({});

  const productList = (productData as any)?.result || [];
  const vendorList = (vendorData as any)?.result || [];
  const wareHouseList = (wareHouseData as any)?.result || [];
  const branchList = (branchData as any)?.result || [];
  const rackList = (rackData as any)?.result || [];

  // Use RTK Query mutations
  const [createBranchStock, { isLoading: createLoading }] = apiSlice.useCreateBranchStockMutation();
  const [createStockOut, { isLoading: stockoutLoading }] = apiSlice.useCreateStockOutMutation();
  const [createStockStorage, { isLoading: storageLoading }] = apiSlice.useCreateStockStorageMutation();

  // Keep old Redux methods only for StockRevertFromBranch (special case)
  const { StockRevertFromBranch } = useApiActions();
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

  // Handler to open allocate drawer
  const handleAllocate = (record: any) => {
    setAllocateRecord(record);
    setAllocateDrawerOpen(true);
  };

  const handleAllocateSubmit = async (values: any) => {
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
        available_loose_quantity: allocateRecord.available_loose_quantity,
        available_quantity: allocateRecord.available_quantity,
      }).unwrap();
      message.success('Stock allocated successfully');
      setAllocateDrawerOpen(false);
      setAllocateRecord(null);
    } catch (error) {
      message.error('Failed to allocate stock');
    }
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
    try {
      await createStockOut({
        ...values,
        stock_audit_id: stockoutRecord._id,
      }).unwrap();
      message.success('Stock out created successfully');
      setStockoutDrawerOpen(false);
      setStockoutRecord(null);
    } catch (error) {
      message.error('Failed to create stock out');
    }
  };

  // Handler to open storage allocate drawer
  const handleStorageAllocate = (record: any) => {
    setStorageAllocateRecord(record);
    setStorageAllocateDrawerOpen(true);
  };

  // Handler for storage allocate submit
  const handleStorageAllocateSubmit = async (values: any) => {
    try {
      await createStockStorage({
        ...values,
        stock_audit_id: storageAllocateRecord?._id,
      }).unwrap();
      message.success('Storage allocated successfully');
      setStorageAllocateDrawerOpen(false);
      setStorageAllocateRecord(null);
    } catch (error) {
      message.error('Failed to allocate storage');
    }
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
    entityName: 'StockAudit',
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
        createLoading={storageLoading}
      />
    </>
  );
};

export default StockAuditCrud;
