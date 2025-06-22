import React from "react";
import CrudModule from "../../components/common/CrudModule";
import { DatePicker, Input, Select } from "antd";
import { Option } from "antd/es/mentions";
import { getEntityApiRoutes } from "../../helpers/CrudFactory";

const VariantCrud = () => {
  const formItems = [
    // {
    //   label: "Sales Record",
    //   name: "sales_record_id",
    //   rules: [{ required: true, message: "Please select a sales record" }],
    //   component: (
    //     <Select placeholder="Select sales record">
    //       {salesRecords.map((record) => (
    //         <Select.Option key={record._id} value={record._id}>
    //           {record.invoice_no || record._id}
    //         </Select.Option>
    //       ))}
    //     </Select>
    //   ),
    // },
    {
      label: "Payment Date",
      name: "payment_date",
      rules: [{ required: true, message: "Please select a payment date" }],
      component: <DatePicker style={{ width: "100%" }} />,
    },
    {
      label: "Amount Paid",
      name: "amount_paid",
      rules: [{ required: true, message: "Please enter amount paid" }],
      component: <Input type="number" prefix="₹" placeholder="Enter amount" />,
    },
    {
      label: "Payment Mode",
      name: "payment_mode",
      rules: [{ required: true, message: "Please select a payment mode" }],
      component: (
        <Select placeholder="Select mode">
          <Select.Option value="cash">Cash</Select.Option>
          <Select.Option value="upi">UPI</Select.Option>
          <Select.Option value="card">Card</Select.Option>
          <Select.Option value="bank">Bank Transfer</Select.Option>
        </Select>
      ),
    },
    {
      label: "Note",
      name: "note",
      rules: [],
      component: <Input.TextArea rows={3} placeholder="Optional notes" />,
    },
  ];
  const columns = [
    { title: "Amount Paid", dataIndex: "amount_paid", key: "amount_paid" },
    { title: "Payment Pode", dataIndex: "payment_mode", key: "payment_mode" },
    { title: "Note", dataIndex: "note", key: "note" },
  ];

  const apiRoutes = getEntityApiRoutes("PaymentHistory");

  return (
    <CrudModule
      title="Payment History"
      formItems={formItems}
      columns={columns}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default VariantCrud;
