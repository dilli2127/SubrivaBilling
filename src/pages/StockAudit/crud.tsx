import React, { useEffect, useState } from "react";
import CrudModule from "../../components/common/CrudModule";
import { getApiRouteProduct } from "../../helpers/Common_functions";
import { DatePicker, Input, InputNumber, Select, Tag } from "antd";

import dayjs from "dayjs";
import { Form } from "antd";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";

const { Option } = Select;

const StockAudit = () => {
  const [form] = Form.useForm();
  const { ProductsApi, VendorApi } = useApiActions();

  const { items: productList, loading } = useDynamicSelector(
    ProductsApi.getIdentifier("GetAll")
  );
  const { items: vendorList, loading:vendorloading } = useDynamicSelector(
    VendorApi.getIdentifier("GetAll")
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
  }, [ProductsApi, VendorApi]);
  const formItems = [
    {
      label: "Invoice / Reference ID",
      name: "invoice_id",
      rules: [{ required: true, message: "Enter invoice or reference ID!" }],
      component: <Input placeholder="e.g., INV-1001" />,
    },
    {
      label: "Product",
      name: "product",
      rules: [{ required: true, message: "Please select a product!" }],
      component: (
        <Select
          placeholder="Select product"
          showSearch
          allowClear
          loading={loading}
          optionFilterProp="children"
          filterOption={(input, option) =>
            typeof option?.children === "string" &&
            (option.children as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {productList?.result?.map((product: any) => (
            <Select.Option key={product?._id} value={product?._id}>
              {`${product.name} ${product?.VariantItem?.variant_name}`}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      label: "Quantity",
      name: "quantity",
      rules: [{ required: true, message: "Enter quantity!" }],
      component: (
        <InputNumber min={1} placeholder="e.g., 10" style={{ width: "100%" }} />
      ),
    },
    {
      label: "Buying Price (per unit)",
      name: "buy_price",
      rules: [{ required: true, message: "Enter buying price!" }],
      component: (
        <InputNumber
          min={0}
          step={0.01}
          placeholder="₹0.00"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      label: "Total Cost",
      name: "total_cost",
      rules: [],
      disabled: true,
      component: (
        <InputNumber
          placeholder="Auto-calculated"
          disabled
          style={{ width: "100%" }}
        />
      ),
    },
    {
      label: "Selling Price",
      name: "sell_price",
      rules: [],
      component: (
        <InputNumber
          min={0}
          step={0.01}
          placeholder="₹0.00"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      label: "Batch Number",
      name: "batch_no",
      rules: [],
      component: <Input placeholder="Optional batch number" />,
    },
    {
      label: "Manufacturing Date",
      name: "mfg_date",
      rules: [],
      component: <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />,
    },
    {
      label: "Expiry Date",
      name: "expiry_date",
      rules: [
        {
          required: true,
          message: "Enter expiry date!",
        },
        ({ getFieldValue }: { getFieldValue: (name: string) => any }) => ({
          validator(_: any, value: any) {
            const mfg = getFieldValue("mfg_date");
            if (mfg && value && value.isBefore(mfg)) {
              return Promise.reject(new Error("Expiry must be after MFG date"));
            }
            return Promise.resolve();
          },
        }),
      ],
      component: <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />,
    },
    {
      label: "Vendor",
      name: "vendor",
      rules: [],
       component: (
        <Select
          placeholder="Select Vendor"
          showSearch
          allowClear
          loading={vendorloading}
          optionFilterProp="children"
          filterOption={(input, option) =>
            typeof option?.children === "string" &&
            (option.children as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {vendorList?.result?.map((vendor: any) => (
            <Select.Option key={vendor?._id} value={vendor?._id}>
              {`${vendor.vendor_name} ${vendor?.company_name}`}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      label: "Buyed Date",
      name: "buyed_date",
      initialValue: dayjs(), // default to today
      rules: [{ required: true, message: "Select the buyed date" }],
      component: <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />,
    },
    {
      label: "Payment Status",
      name: "payment_status",
      rules: [{ required: true, message: "Select payment status!" }],
      component: (
        <Select placeholder="Select payment status">
          <Option value="paid">Paid</Option>
          <Option value="pending">Pending</Option>
          <Option value="partial">Partial</Option>
        </Select>
      ),
    },
    {
      label: "Stock Type",
      name: "stock_type",
      rules: [{ required: true, message: "Select stock movement type!" }],
      component: (
        <Select placeholder="In or Out">
          <Option value="in">Stock In</Option>
          <Option value="out">Stock Out</Option>
        </Select>
      ),
    },
    {
      label: "In / Out Reason",
      name: "out_reason",
      dependencies: ["stock_type"],
      rules: [
        ({ getFieldValue }: { getFieldValue: (name: string) => any }) => ({
          validator(_: any, value: any) {
            if (getFieldValue("stock_type") === "out" && !value) {
              return Promise.reject(
                new Error("Reason required for stock out!")
              );
            }
            return Promise.resolve();
          },
        }),
      ],
      component: <Input.TextArea placeholder="Reason for stock out" rows={2} />,
    },
    {
      label: "Warehouse / Location",
      name: "location",
      rules: [],
      component: (
        <Select placeholder="Select warehouse/location" allowClear showSearch>
          {/* Example options: */}
          <Option value="main">Main Warehouse</Option>
          <Option value="branch1">Branch 1</Option>
        </Select>
      ),
    },
    {
      label: "Note",
      name: "note",
      rules: [],
      component: <Input.TextArea rows={2} placeholder="Optional remarks" />,
    },
  ];

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Variant",
      dataIndex: "variant",
      key: "variant",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  const apiRoutes = {
    get: getApiRouteProduct("GetAll"),
    create: getApiRouteProduct("Create"),
    update: getApiRouteProduct("Update"),
    delete: getApiRouteProduct("Delete"),
  };

  return (
    <CrudModule
      title="Stock Audit"
      formItems={formItems}
      columns={columns}
      drawerWidth={600}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default StockAudit;
