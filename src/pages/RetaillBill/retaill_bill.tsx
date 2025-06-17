import React, { useEffect, useState } from "react";
import { Form, Button, Typography, Drawer, message, Switch, InputNumber, Space } from "antd";
import dayjs from "dayjs";
import { useApiActions } from "../../services/api/useApiActions";
import { dynamic_clear, useDynamicSelector } from "../../services/redux";
import CustomerCrud from "../../pages/Customer/crud";
import { getApiRouteRetailBill } from "../../helpers/Common_functions";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { API_ROUTES } from "../../services/api/utils";
import BillForm from "./components/BillForm";
import BillItemsTable from "./components/BillItemsTable";
import PaymentStatus from "./components/PaymentStatus";
import BillViewModal from "./components/BillViewModal";

const { Title } = Typography;

interface RetailBillingTableProps {
  billdata: any;
  onSuccess?: () => void;
}

const RetailBillingTable: React.FC<RetailBillingTableProps> = ({
  billdata,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const getRoute = getApiRouteRetailBill("GetAll");
  const addRoute = getApiRouteRetailBill("Create");
  const updateRoute = getApiRouteRetailBill("Update");
  const deleteRoute = getApiRouteRetailBill("Delete");

  const dispatch: Dispatch<any> = useDispatch();
  const { ProductsApi, StockAuditApi, CustomerApi, SalesRecord } =
    useApiActions();

  interface DataSourceItem {
    key: number;
    name: string;
    qty: number;
    price: number;
    amount: number;
    product: any;
    stock: any;
    loose_qty: number;
    _id?: string;
    tax_percentage?: number;
  }

  const [dataSource, setDataSource] = useState<DataSourceItem[]>([
    {
      key: 0,
      name: "",
      qty: 0,
      price: 0,
      amount: 0,
      product: undefined,
      stock: undefined,
      loose_qty: 0,
    },
  ]);

  const [customerDrawerVisible, setCustomerDrawerVisible] = useState(false);
  const [count, setCount] = useState(1);
  const [isPaid, setIsPaid] = useState(billdata?.is_paid ?? true);
  const [isPartiallyPaid, setIsPartiallyPaid] = useState(
    billdata?.is_partially_paid ?? false
  );
  const [isRetail, setIsRetail] = useState(billdata?.is_retail ?? true);
  const [isGstIncluded, setIsGstIncluded] = useState(billdata?.is_gst_included ?? true);
  const [discount, setDiscount] = useState(billdata?.discount ?? 0);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>(billdata?.discount_type ?? 'percentage');

  const { items: createItems, error: createError } = useDynamicSelector(
    addRoute.identifier
  );
  const { items: updateItems, error: updateError } = useDynamicSelector(
    updateRoute.identifier
  );
  const { items: productList } = useDynamicSelector(
    ProductsApi.getIdentifier("GetAll")
  );
  const { items: stockAuditList } = useDynamicSelector(
    StockAuditApi.getIdentifier("GetAll")
  );
  const { items: customerList } = useDynamicSelector(
    CustomerApi.getIdentifier("GetAll")
  );

  const [billViewVisible, setBillViewVisible] = useState(false);
  const [currentBill, setCurrentBill] = useState<any>(null);

  const handleChange = (value: any, key: number, column: string) => {
    const newData = [...dataSource];
    const item = newData.find((item) => item.key === key);
    if (!item) return;

    const getSelectedStock = () =>
      stockAuditList?.result?.find((s: any) => s._id === item.stock);

    const getProductCategory = () => {
      const product = productList?.result?.find((p: any) => p._id === item.product);
      return product?.CategoryItem
      ;
    };

    const calculateAmount = () => {
      const selectedStock = getSelectedStock();
      const sellPrice = selectedStock?.sell_price || 0;
      const packQty = selectedStock?.quantity || 1;
      const looseRate = sellPrice / packQty;
      const baseAmount = (item.qty || 0) * sellPrice + (item.loose_qty || 0) * looseRate;

      // Get category tax percentage
      const category = getProductCategory();
      const taxPercentage = category?.tax_percentage || 0;

      // If GST is included, calculate the base price
      if (isGstIncluded) {
        return baseAmount;
      } else {
        // If GST is excluded, add tax amount
        const taxAmount = baseAmount * (taxPercentage / 100);
        return baseAmount + taxAmount;
      }
    };

    switch (column) {
      case "product":
        item.product = value;
        item.stock = undefined;
        item.price = 0;
        item.amount = 0;
        // Get and store tax percentage from category
        const category = getProductCategory();
        item.tax_percentage = category?.tax_percentage || 0;
        break;

      case "stock":
        item.stock = value;
        const stock = getSelectedStock();
        item.price = stock?.sell_price || 0;
        item.amount = calculateAmount();
        break;

      case "qty":
        item.qty = value;
        item.amount = calculateAmount();
        break;

      case "loose_qty":
        item.loose_qty = value;
        item.amount = calculateAmount();
        break;

      case "price":
        item.price = value;
        item.amount = calculateAmount();
        break;
    }

    setDataSource(newData);
  };

  useEffect(() => {
    if (billdata) {
      form.setFieldsValue({
        invoice_no: billdata.invoice_no,
        date: dayjs(billdata.date),
        customer: billdata.customer_id,
        payment_mode: billdata.payment_mode,
      });

      const transformedItems = billdata?.Items?.map(
        (item: any, index: number) => ({
          _id: item._id,
          key: index,
          name: "",
          qty: item.qty,
          price: item.price,
          amount: item.amount,
          product: item.product_id,
          stock: item.stock_id,
          loose_qty: item.loose_qty || 0,
        })
      );

      setDataSource(transformedItems);
      setCount(transformedItems.length);

      if (transformedItems.length > 0) {
        const productIds = transformedItems.map((item: any) => item.product);
        StockAuditApi("GetAll", { products: productIds });
      }
    }
  }, [billdata, form, StockAuditApi]);

  const calculateTotalWithTaxAndDiscount = () => {
    const subtotal = dataSource.reduce((sum, item) => {
      const baseAmount = Number(item.amount);
      return sum + baseAmount;
    }, 0);

    let total = subtotal;

    // Apply discount
    if (discount > 0) {
      if (discountType === 'percentage') {
        total = total - (total * (discount / 100));
      } else {
        total = total - discount;
      }
    }

    return total;
  };

  // Calculate total GST amount
  const calculateTotalGST = () => {
    return dataSource.reduce((sum, item) => {
      const baseAmount = Number(item.amount);
      const product = productList?.result?.find((p: any) => p._id === item.product);
      const taxPercentage = product?.CategoryItem?.tax_percentage || 0;
      
      if (isGstIncluded) {
        // If GST is included, calculate the tax amount from the total
        return sum + (baseAmount * taxPercentage) / (100 + taxPercentage);
      } else {
        // If GST is excluded, calculate the tax amount directly
        return sum + (baseAmount * taxPercentage / 100);
      }
    }, 0);
  };

  const handleSubmit = async (values: any) => {
    console.log("Form Values:", dataSource);
    const items = dataSource.map((item) => ({
      product_id: item.product,
      stock_id: item.stock,
      qty: item.qty,
      loose_qty: item.loose_qty,
      price: item.price,
      amount: item.amount,
      _id: item._id,
      tax_percentage: productList?.result?.find((p: any) => p._id === item.product)?.CategoryItem?.tax_percentage || 0
    }));

    const totalGST = calculateTotalGST();
    const subtotal = dataSource.reduce((sum, item) => sum + Number(item.amount), 0);
    let total = subtotal;

    // Apply discount
    if (discount > 0) {
      if (discountType === 'percentage') {
        total = total - (total * (discount / 100));
      } else {
        total = total - discount;
      }
    }

    const payload = {
      invoice_no: values.invoice_no,
      date: dayjs(values.date).format("YYYY-MM-DD"),
      customer_id: values.customer,
      payment_mode: values.payment_mode,
      items,
      subtotal_amount: subtotal,
      total_gst: totalGST,
      total_amount: total,
      is_paid: isPaid,
      is_partially_paid: isPartiallyPaid,
      sale_type: isRetail ? "retail" : "wholesale",
      is_gst_included: isGstIncluded,
      discount: discount,
      discount_type: discountType,
      paid_amount: isPartiallyPaid
        ? values.paid_amount
        : isPaid
        ? total
        : 0,
    };

    try {
      if (billdata) {
        await SalesRecord("Update", { ...payload }, billdata._id);
      } else {
        await SalesRecord("Create", payload);
      }
    } catch (error) {
      console.error("Sale submission failed:", error);
    }
  };

  useEffect(() => {
    if (createItems?.statusCode === "200") {
      handleApiResponse("create", true);
      if (createItems?.result) {
        const formattedBill = {
          ...createItems.result,
          customer: customerList?.result?.find((c: any) => c._id === form.getFieldValue("customer")),
          items: dataSource.map((item) => {
            const product = productList?.result?.find((p: any) => p._id === item.product);
            return {
              ...item,
              productItems: {
                ...product,
                name: product?.name || '',
                VariantItem: product?.VariantItem || null
              },
              qty: item.qty || 0,
              price: item.price || 0,
              amount: item.amount || 0,
              loose_qty: item.loose_qty || 0
            };
          }),
          total_amount: calculateTotalWithTaxAndDiscount(),
          is_paid: isPaid,
          is_partially_paid: isPartiallyPaid,
          paid_amount: isPartiallyPaid ? form.getFieldValue("paid_amount") : isPaid ? calculateTotalWithTaxAndDiscount() : 0
        };
        setCurrentBill(formattedBill);
        setBillViewVisible(true);

        // Reset form and data after successful submission
        form.resetFields();
        setDataSource([{
          key: 0,
          name: "",
          qty: 0,
          price: 0,
          amount: 0,
          product: undefined,
          stock: undefined,
          loose_qty: 0,
        }]);
        setCount(1);
        setIsPaid(true);
        setIsPartiallyPaid(false);
      }
    }
    if (createError) handleApiResponse("create", false);
  }, [createItems, createError]);

  const handleAdd = () => {
    setDataSource([
      ...dataSource,
      {
        key: count,
        name: "",
        qty: 0,
        price: 0,
        amount: 0,
        product: undefined,
        stock: undefined,
        loose_qty: 0,
      },
    ]);
    setCount(count + 1);
  };

  const handleDelete = async (key: number) => {
    try {
      if (billdata) {
        await SalesRecord("Delete", { id: billdata._id });
        handleApiResponse("delete", true);
      }
      const newData = dataSource.filter((item) => item.key !== key);
      setDataSource(newData);
    } catch (error) {
      console.error("Delete failed:", error);
      handleApiResponse("delete", false);
    }
  };

  const handleApiResponse = (
    action: "create" | "update" | "delete",
    success: boolean
  ) => {
    const title = "Sale";
    if (success) {
      message.success(`${title} ${action}d successfully`);
      if (action === "create") {
        form.resetFields();
        setDataSource([]);
      }
      if (action === "update" || action === "delete") {
        onSuccess?.();
      }
      const actionRoute = getApiRouteRetailBill(
        (action.charAt(0).toUpperCase() +
          action.slice(1)) as keyof typeof API_ROUTES.SalesRecord
      );
      dispatch(dynamic_clear(actionRoute.identifier));
    } else {
      message.error(`Failed to ${action} ${title}`);
    }
  };

  useEffect(() => {
    ProductsApi("GetAll");
    CustomerApi("GetAll");
  }, [ProductsApi, CustomerApi]);

  useEffect(() => {
    if (updateItems?.statusCode === "200") handleApiResponse("update", true);
    if (updateError) handleApiResponse("update", false);
  }, [updateItems, updateError]);

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: dayjs(),
          payment_mode: "cash",
          ...(billdata && {
            invoice_no: billdata.invoice_no,
            date: dayjs(billdata.date),
            customer: billdata.customer_id,
            payment_mode: billdata.payment_mode,
            paid_amount: billdata.paid_amount,
          }),
        }}
        style={{
          margin: "auto",
          background: "#f0f5ff",
          padding: 24,
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
        }}
      >
        <Title level={3} style={{ color: "#1890ff", textAlign: "center" }}>
          {billdata 
            ? `Edit ${isRetail ? "Bill" : "Invoice"}`
            : `Create ${isRetail ? "Bill" : "Invoice"}`}
        </Title>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Space>
            <Switch
              checkedChildren="Retail"
              unCheckedChildren="Wholesale"
              checked={isRetail}
              onChange={setIsRetail}
              style={{ marginRight: 8 }}
            />
            <Switch
              checkedChildren="GST Included"
              unCheckedChildren="GST Excluded"
              checked={isGstIncluded}
              onChange={setIsGstIncluded}
            />
          </Space>
        </div>

        <BillForm
          customerList={customerList}
          onAddCustomer={() => setCustomerDrawerVisible(true)}
        />

        <BillItemsTable
          dataSource={dataSource}
          productList={productList}
          stockAuditList={stockAuditList}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onChange={handleChange}
          onStockAuditFetch={(productId) =>
            StockAuditApi("GetAll", { product: productId })
          }
          total_amount={calculateTotalWithTaxAndDiscount()}
          total_gst={calculateTotalGST()}
          isPartiallyPaid={isPartiallyPaid}
          paid_amount={form.getFieldValue("paid_amount") || 0}
          isGstIncluded={isGstIncluded}
        />

        <div style={{ 
          marginTop: 16, 
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '8px'
        }}>
          <InputNumber
            min={0}
            max={discountType === 'percentage' ? 100 : undefined}
            value={discount}
            onChange={(value) => setDiscount(value || 0)}
            addonBefore="Discount"
            addonAfter={discountType === 'percentage' ? '%' : '₹'}
            style={{ width: 200 }}
          />
          <Switch
            checkedChildren="%"
            unCheckedChildren="₹"
            checked={discountType === 'percentage'}
            onChange={(checked) => setDiscountType(checked ? 'percentage' : 'amount')}
          />
        </div>

        <PaymentStatus
          isPaid={isPaid}
          isPartiallyPaid={isPartiallyPaid}
          onPaidChange={(checked) => {
            setIsPaid(checked);
            if (checked) setIsPartiallyPaid(false);
          }}
          onPartiallyPaidChange={(checked) => {
            setIsPartiallyPaid(checked);
            if (checked) setIsPaid(false);
          }}
          total_amount={calculateTotalWithTaxAndDiscount()}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: "#1890ff",
              borderColor: "#1890ff",
              fontWeight: "bold",
              fontSize: 16,
              minWidth: 140,
            }}
          >
            {billdata 
              ? "Update Sale" 
              : isRetail 
                ? "Create Bill" 
                : "Create Invoice"}
          </Button>
        </div>
      </Form>

      <Drawer
        title="Add New Customer"
        open={customerDrawerVisible}
        onClose={() => setCustomerDrawerVisible(false)}
        width={500}
        destroyOnClose
      >
        <CustomerCrud />
      </Drawer>

      {currentBill && (
        <BillViewModal
          visible={billViewVisible}
          onClose={() => setBillViewVisible(false)}
          billData={currentBill}
        />
      )}

      <style>
        {`
          .custom-row:hover {
            background-color: #bae7ff !important;
            transition: background-color 0.3s ease;
          }
          .ant-select-dropdown {
            scrollbar-width: thin;
            scrollbar-color: #1890ff #f0f5ff;
          }
          .ant-select-dropdown::-webkit-scrollbar {
            width: 6px;
          }
          .ant-select-dropdown::-webkit-scrollbar-thumb {
            background-color: #1890ff;
            border-radius: 10px;
          }
        `}
      </style>
    </>
  );
};

export default RetailBillingTable;
