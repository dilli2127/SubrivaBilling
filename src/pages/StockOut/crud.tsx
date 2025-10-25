import React, { useEffect } from "react";
import { DatePicker, Input, InputNumber, Select } from "antd";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import { GenericCrudPage } from "../../components/common/GenericCrudPage";
import type { StockOut } from "../../types/entities";
const { Option } = Select;
type StockAudit = {
  _id: string;
  batch_no: string;
  category_name: string;
  ProductItem?: {
    name?: string;
    VariantItem?: {
      variant_name?: string;
    };
  };
};
const StockOutCrud: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const StockAuditApi = getEntityApi("StockAudit");
  const { items: StockAuditList, loading: stockAuditLoading } =
    useDynamicSelector(StockAuditApi.getIdentifier("GetAll"));

  useEffect(() => {
    StockAuditApi("GetAll");
  }, [StockAuditApi]);

  type StockOutRecord = {
    stock_audit_items?: {
      batch_no?: string;
      ProductItem?: {
        name?: string;
        category?: string;
        VariantItem?: {
          variant_name?: string;
        };
      };
      pack_size?: string;
      pack_type?: string;
    };
    out_reason?: string;
    quantity?: number;
    batch_no?: string;
  };

  const stockOutConfig = {
    title: "Stock Out",
    columns: [
      {
        title: "Product",
        key: "product",
        render: (_: any, record: StockOutRecord) =>
          [
            record.stock_audit_items?.ProductItem?.name,
            record.stock_audit_items?.ProductItem?.VariantItem?.variant_name,
            record?.stock_audit_items?.batch_no
          ]
            .filter(Boolean)
            .join(" - ") || "N/A",
      },
      {
        title: "Out Reason",
        dataIndex: "out_reason",
        key: "out_reason",
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Pack Size",
        key: "pack_size",
        render: (_: any, record: StockOutRecord) =>
          record.stock_audit_items?.pack_size || "N/A",
      },
    ],
    formItems: [
      {
        label: "Stock In Batch",
        name: "stock_audit_id",
        rules: [{ required: true, message: "Please select the stock batch" }],
        component: (
          <Select
            placeholder="Select category"
            loading={stockAuditLoading}
            showSearch
            allowClear
          >
            {(StockAuditList?.result || []).map((cat: StockAudit) => (
              <Option key={cat._id} value={cat._id}>
                {cat?.ProductItem?.name} -{" "}
                {cat?.ProductItem?.VariantItem?.variant_name} - {cat?.batch_no}
              </Option>
            ))}
          </Select>
        ),
      },
      {
        label: "Quantity",
        name: "quantity",
        rules: [{ required: true, message: "Enter quantity to remove" }],
        component: (
          <InputNumber min={1} placeholder="e.g., 5" style={{ width: "100%" }} />
        ),
      },
      {
        label: "Reason",
        name: "out_reason",
        rules: [{ required: true, message: "Please enter the reason" }],
        component: (
          <Select placeholder="Reason for stock out">
            <Select.Option value="expired">Expired</Select.Option>
            <Select.Option value="damaged">Damaged</Select.Option>
            <Select.Option value="internal_use">Internal Use</Select.Option>
            <Select.Option value="bulk_sale">Bulk Sale</Select.Option>
            <Select.Option value="return_to_vendor">
              Return to Vendor
            </Select.Option>
          </Select>
        ),
      },
      {
        label: "Out Date",
        name: "out_date",
        rules: [{ required: true, message: "Please select the date" }],
        component: (
          <DatePicker placeholder="Select Date" style={{ width: "100%" }} />
        ),
      },
      {
        label: "Note",
        name: "note",
        rules: [],
        component: <Input.TextArea rows={3} placeholder="Optional note" />,
      },
    ],
    entityName: "StockOut",
    formColumns: 2,
  };

  return <GenericCrudPage config={stockOutConfig} />;
};

export default StockOutCrud;
