import React from "react";
import CrudModule from "../../components/common/CrudModule";
import { getApiRouteVendor } from "../../helpers/Common_functions";
import { Input, Switch } from "antd";

const VendorCrud = () => {
  const formItems = [
    {
      label: "Vendor Name",
      name: "vendor_name",
      rules: [{ required: true, message: "Please enter vendor name" }],
      component: <Input placeholder="Enter vendor name" />,
    },
    {
      label: "Company Name",
      name: "company_name",
      component: <Input placeholder="Enter company name" />,
    },
    {
      label: "Contact Person",
      name: "contact_person",
      component: <Input placeholder="Enter contact person name" />,
    },
    {
      label: "Phone",
      name: "phone",
      rules: [
        { required: true, message: "Please enter phone number" },
        { pattern: /^\d{10}$/, message: "Phone number must be 10 digits" },
      ],
      component: <Input placeholder="Enter phone number" maxLength={10} />,
    },
    {
      label: "Email",
      name: "email",
      rules: [{ type: "email", message: "Enter a valid email" }],
      component: <Input placeholder="Enter email address" />,
    },
    {
      label: "GST Number",
      name: "gst_no",
      component: <Input placeholder="Enter GST number" />,
    },
    {
      label: "PAN Number",
      name: "pan_no",
      component: <Input placeholder="Enter PAN number" />,
    },
    {
      label: "Address",
      name: "address",
      component: <Input.TextArea placeholder="Enter address" rows={3} />,
    },
    {
      label: "City",
      name: "city",
      component: <Input placeholder="Enter city" />,
    },
    {
      label: "State",
      name: "state",
      component: <Input placeholder="Enter state" />,
    },
    {
      label: "Pincode",
      name: "pincode",
      component: <Input placeholder="Enter pincode" maxLength={6} />,
    },
    {
      label: "Status",
      name: "status",
      valuePropName: "checked", // for Switch
      component: (
        <Switch
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          defaultChecked
        />
      ),
    },
  ];

  const columns = [
    {
      title: "Vendor Name",
      dataIndex: "vendor_name",
      key: "vendor_name",
    },
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Contact Person",
      dataIndex: "contact_person",
      key: "contact_person",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "GST No",
      dataIndex: "gst_no",
      key: "gst_no",
    },
    {
      title: "PAN No",
      dataIndex: "pan_no",
      key: "pan_no",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) =>
        status ? (
          <span style={{ color: "green" }}>Active</span>
        ) : (
          <span style={{ color: "red" }}>Inactive</span>
        ),
    },
  ];

  const apiRoutes = {
    get: getApiRouteVendor("GetAll"),
    create: getApiRouteVendor("Create"),
    update: getApiRouteVendor("Update"),
    delete: getApiRouteVendor("Delete"),
  };

  return (
    <CrudModule
      title="Vendor"
      formItems={formItems}
      columns={columns}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default VendorCrud;
