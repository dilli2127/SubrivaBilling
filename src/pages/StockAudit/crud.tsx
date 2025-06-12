import React, { useCallback, useEffect, useState } from "react";
import CrudModule from "../../components/common/CrudModule";
import {
  getApiRouteCategory,
  getApiRouteProduct,
  getApiRouteVariant,
} from "../../helpers/Common_functions";
import { DatePicker, Input, InputNumber, Select, Switch, Tag } from "antd";
import { ApiRequest } from "../../services/api/apiService";
import { dynamic_request, useDynamicSelector } from "../../services/redux";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import dayjs from "dayjs";
import { Form } from "antd";
import { useApiActions } from "../../services/api/useApiActions";

const { Option } = Select;

const StockAudit = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const [form] = Form.useForm();
  const variantRoute = getApiRouteVariant("Get");
  const categoryRoute = getApiRouteCategory("Get");
  const { ProductsApi } = useApiActions();
  const { loading: variantLoading, items: variantItems } = useDynamicSelector(
    variantRoute.identifier
  );
  const { loading: categoryLoading, items: categoryItems } = useDynamicSelector(
    categoryRoute.identifier
  );
  const { items: productData, loading } = useDynamicSelector(
    ProductsApi.getIdentifier("GetAll")
  );
  const [variantMap, setVariantMap] = useState<Record<string, string>>({});
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  const fetchData = useCallback(() => {
    [variantRoute, categoryRoute].forEach((route) => {
      dispatch(
        dynamic_request(
          { method: route.method, endpoint: route.endpoint, data: {} },
          route.identifier
        )
      );
    });
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createMap = (items: any[], labelKey: string) =>
    items.reduce((acc: Record<string, string>, item) => {
      acc[item._id] = item[labelKey];
      return acc;
    }, {});

  useEffect(() => {
    setVariantMap(createMap(variantItems?.result || [], "variant_name"));
  }, [variantItems]);

  useEffect(() => {
    setCategoryMap(createMap(categoryItems?.result || [], "category_name"));
  }, [categoryItems]);

  useEffect(() => {
    const qty = form.getFieldValue("quantity");
    const price = form.getFieldValue("buy_price");
    if (qty && price) {
      form.setFieldsValue({ total_cost: qty * price });
    }
  }, [form, form.getFieldValue("quantity"), form.getFieldValue("buy_price")]);

  useEffect(() => {
    ProductsApi("GetAll");
  }, [ProductsApi]);
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
        <Select placeholder="Select product" showSearch allowClear>
          {/* Populate from backend */}
        </Select>
      ),
    },
    {
      label: "Variant / Unit",
      name: "variant",
      rules: [{ required: true, message: "Select a variant!" }],
      component: (
        <Select placeholder="Select variant" showSearch allowClear>
          {/* Populate from backend */}
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
        <Select placeholder="Select vendor" showSearch allowClear>
          {/* Populate dynamically */}
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
      render: (id: string) => categoryMap[id] || "-",
    },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Variant",
      dataIndex: "variant",
      key: "variant",
      render: (id: string) => variantMap[id] || "-",
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
