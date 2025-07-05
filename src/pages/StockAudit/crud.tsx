import React, { useEffect, useState } from "react";
import { Form } from "antd";

import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import { GenericCrudPage } from "../../components/common/GenericCrudPage";
import { getEntityApiRoutes } from "../../helpers/CrudFactory";
import { stockAuditColumns } from "./columns";
import { getStockAuditFormItems } from "./formItems";

const StockAuditCrud: React.FC = () => {
  const [form] = Form.useForm();
  const { getEntityApi } = useApiActions();
  const ProductsApi = getEntityApi("Product");
  const VendorApi = getEntityApi("Vendor");
  const WarehouseApi = getEntityApi("Warehouse");

  const { items: productList, loading } = useDynamicSelector(
    ProductsApi.getIdentifier("GetAll")
  );
  const { items: vendorList, loading: vendorloading } = useDynamicSelector(
    VendorApi.getIdentifier("GetAll")
  );
  const { items: wareHouseList, loading: wareHouseLoading } =
    useDynamicSelector(WarehouseApi.getIdentifier("GetAll"));

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
  }, [ProductsApi, VendorApi, WarehouseApi]);

  const stockAuditConfig = {
    title: "Stock Audit",
    columns: stockAuditColumns,
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

  return <GenericCrudPage config={stockAuditConfig} />;
};

export default StockAuditCrud;
