import React, { useEffect, useState } from "react";
import { Form, message } from "antd";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import { GenericCrudPage } from "../../components/common/GenericCrudPage";
import { getEntityApiRoutes } from "../../helpers/CrudFactory";
import { stockAuditColumns } from "./columns";
import { getStockAuditFormItems } from "./formItems";
import AllocateDrawer from "./AllocateDrawer";
import RevertDrawer from "./RevertDrawer";
import StockOutDrawer from "./StockOutDrawer";

const StockAuditCrud: React.FC = () => {
  const [form] = Form.useForm();
  const [allocateDrawerOpen, setAllocateDrawerOpen] = useState(false);
  const [allocateRecord, setAllocateRecord] = useState<any>(null);
  const [revertDrawerOpen, setRevertDrawerOpen] = useState(false);
  const [revertRecord, setRevertRecord] = useState<any>(null);
  const [stockoutDrawerOpen, setStockoutDrawerOpen] = useState(false);
  const [stockoutRecord, setStockoutRecord] = useState<any>(null);

  const { getEntityApi } = useApiActions();
  const ProductsApi = getEntityApi("Product");
  const VendorApi = getEntityApi("Vendor");
  const WarehouseApi = getEntityApi("Warehouse");
  const BranchApi = getEntityApi("Braches");

  const { items: productList, loading } = useDynamicSelector(
    ProductsApi.getIdentifier("GetAll")
  );
  const { items: vendorList, loading: vendorloading } = useDynamicSelector(
    VendorApi.getIdentifier("GetAll")
  );
  const { items: wareHouseList, loading: wareHouseLoading } =
    useDynamicSelector(WarehouseApi.getIdentifier("GetAll"));
  const { items: branchList, loading: branchLoading } = useDynamicSelector(
    BranchApi.getIdentifier("GetAll")
  );

  useEffect(() => {
    const qty = form.getFieldValue("quantity");
    const price = form.getFieldValue("buy_price");
    if (qty && price) {
      form.setFieldsValue({ total_cost: qty * price });
    }
  }, [form, form.getFieldValue("quantity"), form.getFieldValue("buy_price")]);

  useEffect(() => {
    ProductsApi("GetAll");
    VendorApi("GetAll");
    WarehouseApi("GetAll");
    BranchApi("GetAll");
  }, [ProductsApi, VendorApi, WarehouseApi, BranchApi]);

  // Handler to open allocate drawer
  const handleAllocate = (record: any) => {
    setAllocateRecord(record);
    setAllocateDrawerOpen(true);
  };

  // Handler for allocation submit
  const handleAllocateSubmit = async (values: any) => {
    // Here you would call your allocation API
    // Example: await allocateStock({ ...values, stock_audit_id: allocateRecord._id })
    message.success("Stock allocated successfully!");
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
    // Here you would call your revert API
    // Example: await revertStock({ ...values, stock_audit_id: revertRecord._id })
    message.success("Stock reverted successfully!");
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
    // Here you would call your stockout API
    // Example: await stockoutStock({ ...values, stock_audit_id: stockoutRecord._id })
    message.success("Stock marked as out successfully!");
    setStockoutDrawerOpen(false);
    setStockoutRecord(null);
  };

  const stockAuditConfig = {
    title: "Stock Audit",
    columns: stockAuditColumns({ onAllocate: handleAllocate, onRevert: handleRevert, onStockout: handleStockout }),
    formItems: getStockAuditFormItems(
      productList,
      vendorList,
      wareHouseList,
      loading,
      vendorloading,
      wareHouseLoading
    ),
    apiRoutes: getEntityApiRoutes("StockAudit"),
    formColumns: 2,
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
      />
      <RevertDrawer
        open={revertDrawerOpen}
        onClose={() => setRevertDrawerOpen(false)}
        onSubmit={handleRevertSubmit}
        record={revertRecord}
        branchList={branchList}
        branchLoading={branchLoading}
      />
      <StockOutDrawer
        open={stockoutDrawerOpen}
        onClose={() => setStockoutDrawerOpen(false)}
        onSubmit={handleStockoutSubmit}
        record={stockoutRecord}
      />
    </>
  );
};

export default StockAuditCrud;
