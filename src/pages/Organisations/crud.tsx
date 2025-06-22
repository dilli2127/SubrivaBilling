import React from "react";
import CrudModule from "../../components/common/CrudModule";
import { getEntityApiRoutes } from "../../helpers/CrudFactory";
import { Input, Switch } from "antd";

const OrganisationsCrud = () => {
  const formItems = [
    {
      label: "Organization Name",
      name: "org_name",
      rules: [{ required: true, message: "Please enter organization name!" }],
      component: <Input placeholder="Enter organization name" />,
    },
    {
      label: "Organization Code",
      name: "org_code",
      rules: [{ required: true, message: "Please enter organization code!" }],
      component: <Input placeholder="Enter organization code" />,
    },
    {
      label: "Contact Person",
      name: "contact_person",
      rules: [{ required: true, message: "Please enter contact person!" }],
      component: <Input placeholder="Enter contact person name" />,
    },
    {
      label: "Phone",
      name: "phone",
      rules: [{ required: true, message: "Please enter phone number!" }],
      component: <Input placeholder="Enter phone number" />,
    },
    {
      label: "Email",
      name: "email",
      rules: [
        { required: true, message: "Please enter email!" },
        { type: "email", message: "Please enter a valid email!" }
      ],
      component: <Input placeholder="Enter email address" />,
    },
    {
      label: "Address",
      name: "address",
      component: <Input.TextArea placeholder="Enter address" rows={3} />,
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

  const columns = [
    { title: "Organization Name", dataIndex: "org_name", key: "org_name" },
    { title: "Organization Code", dataIndex: "org_code", key: "org_code" },
    { title: "Contact Person", dataIndex: "contact_person", key: "contact_person" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
      render: (status: boolean) => (
        <span style={{ color: status ? "green" : "red" }}>
          {status ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // 🎯 THE MAGIC LINE - Just one line for all CRUD operations!
  const apiRoutes = getEntityApiRoutes("Organisations");

  return (
    <CrudModule
      title="Organizations"
      formItems={formItems}
      columns={columns}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default OrganisationsCrud; 