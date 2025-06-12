import React from "react";
import CrudModule from "../../components/common/CrudModule";
import { getApiRouteWareHouse } from "../../helpers/Common_functions";
import { Input, Switch } from "antd";

const Warehouse = () => {
  const formItems = [
    {
      label: "Warehouse Name",
      name: "warehouse_name",
      rules: [{ required: true, message: "Please enter warehouse name" }],
      component: <Input placeholder="Enter warehouse name" />,
    },
    {
      label: "Code",
      name: "warehouse_code",
      rules: [{ required: true, message: "Please enter warehouse code" }],
      component: <Input placeholder="Enter warehouse code" />,
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
      valuePropName: "checked",
      component: (
        <Switch
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          defaultChecked
        />
      ),
    },
  ];
  const warehouseColumns = [
    {
      title: "Warehouse Name",
      dataIndex: "warehouse_name",
      key: "warehouse_name",
    },
    {
      title: "Code",
      dataIndex: "warehouse_code",
      key: "warehouse_code",
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
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text: string) => text || "-",
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
    },
    {
      title: "Pincode",
      dataIndex: "pincode",
      key: "pincode",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: boolean) => (value ? "Active" : "Inactive"),
    },
  ];

  const apiRoutes = {
    get: getApiRouteWareHouse("GetAll"),
    create: getApiRouteWareHouse("Create"),
    update: getApiRouteWareHouse("Update"),
    delete: getApiRouteWareHouse("Delete"),
  };

  return (
    <CrudModule
      title="Warehouse"
      formItems={formItems}
      columns={warehouseColumns}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default Warehouse;
