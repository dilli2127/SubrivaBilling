import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  InputNumber,
  Button,
  Form,
  DatePicker,
  Select,
  Row,
  Col,
  Typography,
  Drawer,
} from "antd";
import dayjs from "dayjs";
import { DeleteOutlined } from "@ant-design/icons";
import { useApiActions } from "../../services/api/useApiActions";
import { dynamic_clear, useDynamicSelector } from "../../services/redux";
import CustomerCrud from "../../pages/Customer/crud";
import {
  getApiRouteRetailBill,
  showToast,
} from "../../helpers/Common_functions";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
const { Title } = Typography;
const { Option } = Select;
interface RetailBillingTableProps {
  billdata: any;
}
const RetailBillingTable: React.FC<RetailBillingTableProps> = ({ billdata }) => {
  const [form] = Form.useForm();
  const getRoute = getApiRouteRetailBill("GetAll");
  const addRoute = getApiRouteRetailBill("Create");
  const updateRoute = getApiRouteRetailBill("Update");
  const deleteRoute = getApiRouteRetailBill("Delete");

  const dispatch: Dispatch<any> = useDispatch();
  const { ProductsApi, StockAuditApi, CustomerApi, RetailBill } =
    useApiActions();
  const [dataSource, setDataSource] = useState([
    {
      key: 0,
      name: "",
      qty: 0,
      price: 0,
      amount: 0,
      product: undefined,
      stock: undefined,
      looseQty: 0,
    },
  ]);
  const [customerDrawerVisible, setCustomerDrawerVisible] = useState(false);
  const [count, setCount] = useState(1);
  const { items: createItems, error: createError } = useDynamicSelector(
    addRoute.identifier
  );
  const { items: productList, loading: productLoading } = useDynamicSelector(
    ProductsApi.getIdentifier("GetAll")
  );
  const { items: stockAuditList, loding: stockAuditLoading } =
    useDynamicSelector(StockAuditApi.getIdentifier("GetAll"));
  const { items: customerList, loding: costomerLoading } = useDynamicSelector(
    CustomerApi.getIdentifier("GetAll")
  );
  type DataSourceItem = {
    key: number;
    name: string;
    qty: number;
    price: number;
    amount: number;
    stock?: any;
    product?: any;
    looseQty?: number;
  };
  type EditableColumn =
    | "name"
    | "qty"
    | "price"
    | "stock"
    | "product"
    | "looseQty";

  const handleChange = (
    value: any,
    key: number,
    column: EditableColumn | "looseQty"
  ) => {
    const newData = [...dataSource];
    const item = newData.find((item) => item.key === key);
    if (!item) return;

    if (column === "product") {
      item.product = value;
      item.stock = undefined;
      item.price = 0;
      item.amount = 0;
    } else if (column === "stock") {
      item.stock = value;

      const selectedStock = stockAuditList?.result?.find(
        (s: any) => s._id === value
      );
      const sellPrice = selectedStock?.sell_price || 0;
      item.price = sellPrice;

      const quantity = selectedStock?.quantity || 1;
      const looseRate = sellPrice / quantity;

      item.amount =
        (item.qty || 0) * sellPrice + (item.looseQty || 0) * looseRate;
    } else if (column === "qty") {
      item.qty = value;
      const selectedStock = stockAuditList?.result?.find(
        (s: any) => s._id === item.stock
      );
      const sellPrice = selectedStock?.sell_price || 0;
      const quantity = selectedStock?.quantity || 1;
      const looseRate = sellPrice / quantity;

      item.amount = (value || 0) * sellPrice + (item.looseQty || 0) * looseRate;
    } else if (column === "looseQty") {
      item.looseQty = value;
      const selectedStock = stockAuditList?.result?.find(
        (s: any) => s._id === item.stock
      );
      const sellPrice = selectedStock?.sell_price || 0;
      const quantity = selectedStock?.quantity || 1;
      const looseRate = sellPrice / quantity;

      item.amount = (item.qty || 0) * sellPrice + (value || 0) * looseRate;
    } else if (column === "price") {
      item.price = value;
      item.amount = (item.qty || 1) * (value || 0); // Optional: You may also include looseQty logic here
    }

    setDataSource(newData);
  };
  const handleSubmit = async (values: any) => {
    const items = dataSource.map((item) => ({
      product_id: item.product,
      stock_id: item.stock,
      quantity: item.qty,
      loose_quantity: item.looseQty,
      price: item.price,
      amount: item.amount,
    }));
    const payload = {
      invoice_no: values.invoice_no,
      date: dayjs(values.date).format("YYYY-MM-DD"),
      customer_id: values.customer,
      payment_mode: values.payment_mode,
      items,
      total_amount: totalAmount,
    };

    try {
      await RetailBill("Create", payload);
      form.resetFields();
      setDataSource([
        {
          key: 0,
          name: "",
          qty: 0,
          price: 0,
          amount: 0,
          product: undefined,
          stock: undefined,
          looseQty: 0,
        },
      ]);
      setCount(1);
    } catch (error) {
      console.error("Bill submission failed:", error);
    }
  };

  const handleAdd = () => {
    setDataSource([
      ...dataSource,
      {
        key: count,
        name: "",
        qty: 1,
        price: 0,
        amount: 0,
        product: undefined,
        stock: undefined,
        looseQty: 0,
      },
    ]);
    setCount(count + 1);
  };
  const handleDelete = (key: number) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const handleApiResponse = (
    action: "create" | "update" | "delete",
    success: boolean
  ) => {
    const title = "Retail Bill";
    if (success) {
      showToast("success", `${title} ${action}d successfully`);
      resetForm();
      dispatch(dynamic_clear(addRoute.identifier));
    } else {
      showToast("error", `Failed to ${action} ${title}`);
    }
  };
  const resetForm = () => {
    form.resetFields();
  };

  const columns = [
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Add Item</span>
      ),
      dataIndex: "additem",
      width: 180,
      render: (_: any, record: DataSourceItem, index: number) => (
        <div style={{ display: "flex", gap: 8 }}>
          {dataSource.length > 1 && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.key)}
            />
          )}
          {index === dataSource.length - 1 && (
            <Button
              type="dashed"
              onClick={handleAdd}
              style={{
                borderColor: "#1890ff",
                color: "#1890ff",
                fontWeight: "bold",
                fontSize: 16,
                minWidth: 100,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#e6f7ff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "transparent";
              }}
            >
              + Add
            </Button>
          )}
        </div>
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Item Name</span>
      ),
      dataIndex: "product",
      render: (_: any, record: DataSourceItem) => (
        <Select
          value={record.product}
          onChange={(productId) => {
            handleChange(productId, record.key, "product");
            StockAuditApi("GetAll", {
              product: productId,
            });
          }}
          showSearch
          style={{ width: "100%" }}
          placeholder="Select Product"
          optionFilterProp="children"
          allowClear
          filterOption={(input, option) =>
            String(option?.children)
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
          dropdownStyle={{ maxHeight: 150, overflowY: "auto" }}
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
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Stock</span>
      ),
      dataIndex: "stock",
      width: 180,
      render: (_: any, record: DataSourceItem) => (
        <Select
          value={record.stock}
          onChange={(value) => handleChange(value, record.key, "stock")}
          showSearch
          style={{ width: "100%" }}
          placeholder="Select Stock"
          optionFilterProp="children"
          allowClear
          filterOption={(input, option) =>
            String(option?.children)
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
          dropdownStyle={{ maxHeight: 150, overflowY: "auto" }}
        >
          {stockAuditList?.result?.map((stockAudit: any) => (
            <Select.Option key={stockAudit?._id} value={stockAudit?._id}>
              {`${stockAudit.batch_no} - ${stockAudit?.buy_price}`}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: <span style={{ color: "#1890ff", fontWeight: "bold" }}>Qty</span>,
      dataIndex: "qty",
      width: 100,
      render: (_: any, record: DataSourceItem) => (
        <InputNumber
          min={1}
          value={record.qty}
          onChange={(value) => handleChange(value, record.key, "qty")}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Loose Qty</span>
      ),
      dataIndex: "looseQty",
      width: 100,
      render: (_: any, record: DataSourceItem) => (
        <InputNumber
          min={1}
          value={record.looseQty}
          onChange={(value) => handleChange(value, record.key, "looseQty")}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Price</span>
      ),
      dataIndex: "price",
      width: 120,
      render: (_: any, record: DataSourceItem) => (
        <InputNumber
          min={0}
          value={record.price}
          onChange={(value) => handleChange(value, record.key, "price")}
          style={{ width: "100%" }}
          formatter={(value) =>
            `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => Number(value!.replace(/₹\s?|(,*)/g, ""))}
        />
      ),
    },
    {
      title: (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>Amount</span>
      ),
      dataIndex: "amount",
      width: 140,
      render: (_: any, record: DataSourceItem) => (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>
          ₹ {record.amount.toFixed(2)}
        </span>
      ),
    },
  ];
  const totalAmount = dataSource.reduce((sum, item) => sum + item.amount, 0);
  useEffect(() => {
    ProductsApi("GetAll");
    CustomerApi("GetAll");
  }, [ProductsApi, CustomerApi]);
  useEffect(() => {
    if (createItems?.statusCode === "200") handleApiResponse("create", true);
    if (createError) handleApiResponse("create", false);
  }, [createItems, createError]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ date: dayjs(), payment_mode: "cash" }}
      style={{
        margin: "auto",
        background: "#f0f5ff",
        padding: 24,
        borderRadius: 10,
        boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
      }}
    >
      <Title level={3} style={{ color: "#1890ff", textAlign: "center" }}>
        Create Bill
      </Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Form.Item
            label="Date"
            name="date"
            initialValue={dayjs()}
            style={{ marginBottom: 0 }}
          >
            <DatePicker disabled style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Invoice Number"
            name="invoice_no"
            rules={[{ required: true, message: "Invoice number is required" }]}
            style={{ marginBottom: 0 }}
          >
            <Input
              placeholder="Enter invoice number"
              style={{ borderColor: "#1890ff" }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Form.Item
            label="Customer"
            name="customer"
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: "Please select a customer" }]}
          >
            <Select
              placeholder="Select Customer"
              showSearch
              allowClear
              style={{ width: "100%", borderColor: "#1890ff" }}
              optionFilterProp="children"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: 8,
                      cursor: "pointer",
                      color: "#1890ff",
                      borderTop: "1px solid #f0f0f0",
                    }}
                    onClick={() => setCustomerDrawerVisible(true)}
                  >
                    + Add Customer
                  </div>
                </>
              )}
            >
              {customerList?.result?.map((cust: any) => (
                <Option key={cust._id} value={cust._id}>
                  {cust.full_name} - {cust.mobile}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Payment Mode"
            name="payment_mode"
            style={{ marginBottom: 0 }}
          >
            <Select style={{ borderColor: "#1890ff" }}>
              <Option value="cash">Cash</Option>
              <Option value="upi">UPI</Option>
              <Option value="card">Card</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        rowClassName={() => "custom-row"}
        footer={() => (
          <div
            style={{
              textAlign: "right",
              fontWeight: "bold",
              fontSize: 18,
              color: "#1890ff",
              paddingRight: 16,
            }}
          >
            Total: ₹ {totalAmount.toFixed(2)}
          </div>
        )}
        bordered
      />

      <div
        style={{
          marginTop: 24,
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
          Submit Bill
        </Button>
      </div>

      <style>
        {`
          .custom-row:hover {
            background-color: #bae7ff !important;
            transition: background-color 0.3s ease;
          }
          /* Scrollbar for select dropdown */
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
      <Drawer
        title="Add New Customer"
        open={customerDrawerVisible}
        onClose={() => setCustomerDrawerVisible(false)}
        width={500}
        destroyOnClose
      >
        <CustomerCrud />
      </Drawer>
    </Form>
  );
};

export default RetailBillingTable;
