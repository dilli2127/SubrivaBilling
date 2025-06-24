import React, { useEffect, useState } from "react";
import { DatePicker, Input, InputNumber, Select, Tag, Tooltip } from "antd";

import dayjs from "dayjs";
import { Form } from "antd";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import { AppstoreAddOutlined, BarcodeOutlined, CalendarOutlined, DollarCircleOutlined, TagsOutlined } from "@ant-design/icons";
import { GenericCrudPage } from "../../components/common/GenericCrudPage";
import type { StockAudit } from "../../types/entities";
import { getEntityApiRoutes } from "../../helpers/CrudFactory";

const { Option } = Select;

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
    columns: [
      {
        title: "Invoice ID",
        dataIndex: "invoice_id",
        key: "invoice_id",
        render: (text: string) => (
          <Tag icon={<BarcodeOutlined />} color="blue">
            {text}
          </Tag>
        ),
      },
      {
        title: "Product",
        dataIndex: "ProductItem",
        key: "product",
        render: (product: any) => (
          <Tooltip title={product?.name}>
            <span>
              <TagsOutlined style={{ marginRight: 4 }} />
              {product?.name}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
        render: (qty: number) => (
          <Tag color="green">
            <AppstoreAddOutlined /> {qty}
          </Tag>
        ),
      },
      {
        title: "Available Qty",
        dataIndex: "available_quantity",
        key: "available_quantity",
        render: (qty: number) => (
          <Tag color={qty > 0 ? "green" : "red"}>
            {qty}
          </Tag>
        ),
      },
      {
        title: "Buy Price",
        dataIndex: "buy_price",
        key: "buy_price",
        render: (price: number) => (
          <span>
            <DollarCircleOutlined style={{ marginRight: 4 }} />
            ₹{price}
          </span>
        ),
      },
      {
        title: "Total Cost",
        dataIndex: "total_cost",
        key: "total_cost",
        render: (cost: number) => (
          <span style={{ fontWeight: "bold" }}>
            ₹{cost}
          </span>
        ),
      },
      {
        title: "Buy Date",
        dataIndex: "buyed_date",
        key: "buyed_date",
        render: (date: string) => (
          <span>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {dayjs(date).format("DD/MM/YYYY")}
          </span>
        ),
      },
      {
        title: "Payment Status",
        dataIndex: "payment_status",
        key: "payment_status",
        render: (status: string) => (
          <Tag color={status === "paid" ? "green" : "orange"}>
            {status}
          </Tag>
        ),
      },
    ],
    formItems: [
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
        label: "Available Quantity",
        name: "available_quantity",
        rules: [{ required: true, message: "Enter available quantity!" }],
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
    ],
    apiRoutes: getEntityApiRoutes("StockAudit"),
    formColumns: 2,
  };

  return <GenericCrudPage config={stockAuditConfig} />;
};

export default StockAuditCrud;
