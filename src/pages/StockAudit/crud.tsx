import React, { useEffect, useState } from "react";
import { getApiRouteStockAudit } from "../../helpers/Common_functions";
import { DatePicker, Input, InputNumber, Select, Tag, Tooltip } from "antd";

import dayjs from "dayjs";
import { Form } from "antd";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import StockCrudModule from "../../components/common/StockCrudModule";
import { AppstoreAddOutlined, BarcodeOutlined, CalendarOutlined, DollarCircleOutlined, TagsOutlined } from "@ant-design/icons";

const { Option } = Select;

const StockAudit = () => {
  const [form] = Form.useForm();
  const { ProductsApi, VendorApi, WarehouseApi } = useApiActions();

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
      label: "Warehouse / Location",
      name: "location",
      rules: [],
      component: (
        <Select
          placeholder="Select warehouse"
          showSearch
          allowClear
          loading={wareHouseLoading}
          optionFilterProp="children"
          filterOption={(input, option) =>
            typeof option?.children === "string" &&
            (option.children as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {wareHouseList?.result?.map((wareHouse: any) => (
            <Select.Option key={wareHouse?._id} value={wareHouse?._id}>
              {`${wareHouse.warehouse_name} ${wareHouse?.warehouse_code}`}
            </Select.Option>
          ))}
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
    {
      title: "🧾 Invoice ID",
      dataIndex: "invoice_id",
      key: "invoice_id",
      render: (text:string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Product",
      key: "product_name",
      render: (_:any, record:any) => (
        <span>
          <strong>{record.ProductItem?.name}</strong>
          <br />
          <small style={{ color: "#888" }}>
            {record.ProductItem?.VariantItem?.variant_name || "-"}
          </small>
        </span>
      ),
    },
    {
      title: "Qty (Buyed)",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty:number) => (
        <Tag color="cyan">
          <AppstoreAddOutlined /> {qty}
        </Tag>
      ),
    },
    {
      title: "Buy Price",
      dataIndex: "buy_price",
      key: "buy_price",
      render: (value:any) => {
        const num = Number(value);
        return isNaN(num) ? "-" : (
          <span style={{ color: "#3f8600" }}>
            <DollarCircleOutlined /> ₹{num.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: "Avail Qty",
      key: "available_quantity",
      render: (_:any, record:any) => {
        const qty = record.available_quantity || 0;
        const loose = record.available_loose_quantity || 0;
        return (
          <Tag color="green">
            <AppstoreAddOutlined /> {qty} + {loose}
            <small style={{ marginLeft: 4, color: "#fff" }}>(loose)</small>
          </Tag>
        );
      },
    },
    {
      title: "Sell Price",
      dataIndex: "sell_price",
      key: "sell_price",
      render: (value:any) => {
        const num = Number(value);
        return isNaN(num) ? "-" : (
          <span style={{ color: "#d48806" }}>
            <DollarCircleOutlined /> ₹{num.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: "Batch",
      dataIndex: "batch_no",
      key: "batch_no",
      render: (text:string) => (
        <Tag color="volcano">
          <BarcodeOutlined /> {text}
        </Tag>
      ),
    },
    {
      title: "MFG Date",
      dataIndex: "mfg_date",
      key: "mfg_date",
      render: (value:any) =>
        value ? (
          <Tooltip title={dayjs(value).format("MMMM D, YYYY")}>
            <CalendarOutlined /> {dayjs(value).format("DD-MM-YYYY")}
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "Expiry",
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (value:any) =>
        value ? (
          <Tooltip title={dayjs(value).format("MMMM D, YYYY")}>
            <TagsOutlined style={{ color: "red" }} />{" "}
            {dayjs(value).format("DD-MM-YYYY")}
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "Total Cost",
      dataIndex: "total_cost",
      key: "total_cost",
      render: (value:number) => {
        const num = Number(value);
        return isNaN(num) ? "-" : (
          <strong style={{ color: "#722ed1" }}>₹{num.toFixed(2)}</strong>
        );
      },
    },
  ];

  const apiRoutes = {
    get: getApiRouteStockAudit("GetAll"),
    create: getApiRouteStockAudit("Create"),
    update: getApiRouteStockAudit("Update"),
    delete: getApiRouteStockAudit("Delete"),
  };

  return (
    <StockCrudModule
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
