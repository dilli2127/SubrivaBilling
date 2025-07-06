import React, { useEffect, useState } from "react";
import { Form, Drawer, Button, Select, InputNumber, message } from "antd";

import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import { GenericCrudPage } from "../../components/common/GenericCrudPage";
import { getEntityApiRoutes } from "../../helpers/CrudFactory";
import { stockAuditColumns } from "./columns";
import { getStockAuditFormItems } from "./formItems";

const { Option } = Select;

const StockAuditCrud: React.FC = () => {
  const [form] = Form.useForm();
  const [allocateDrawerOpen, setAllocateDrawerOpen] = useState(false);
  const [allocateRecord, setAllocateRecord] = useState<any>(null);
  const [allocateForm] = Form.useForm();

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
    allocateForm.resetFields();
  };

  // Handler for allocation submit
  const handleAllocateSubmit = async (values: any) => {
    // Here you would call your allocation API
    // Example: await allocateStock({ ...values, stock_audit_id: allocateRecord._id })
    message.success("Stock allocated successfully!");
    setAllocateDrawerOpen(false);
    setAllocateRecord(null);
  };

  const stockAuditConfig = {
    title: "Stock Audit",
    columns: stockAuditColumns({ onAllocate: handleAllocate }),
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
      <Drawer
        title="Allocate Stock"
        open={allocateDrawerOpen}
        onClose={() => setAllocateDrawerOpen(false)}
        width={400}
      >
        <Form form={allocateForm} layout="vertical" onFinish={handleAllocateSubmit}>
          <Form.Item
            name="branch_id"
            label="Branch"
            rules={[{ required: true, message: "Please select a branch" }]}
          >
            <Select
              placeholder="Select branch"
              loading={branchLoading}
              showSearch
              optionFilterProp="children"
            >
              {branchList?.result?.map((branch: any) => (
                <Option key={branch._id} value={branch._id}>
                  {branch.branch_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="added_quantity"
            label="Quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Allocate
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default StockAuditCrud;
