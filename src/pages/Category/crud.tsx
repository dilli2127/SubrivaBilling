import React from "react";
import CrudModule from "../../components/common/CrudModule";
import { getApiRouteCategory } from "../../helpers/Common_functions";
import { Input, InputNumber } from "antd";
const CategoryCrud = () => {
  const formItems = [
    {
      label: "Category Name",
      name: "category_name",
      rules: [{ required: true, message: "Please enter category name" }],
      component: <Input placeholder="Enter category name" />,
    },
    {
      label: "HSN Code",
      name: "hsn_code",
      rules: [{ required: true, message: "Please enter HSN code" }],
      component: <Input placeholder="Enter HSN code" />,
    },
    {
      label: "Tax Percentage",
      name: "tax_percentage",
      rules: [{ required: true, message: "Please enter tax percentage" }],
      component: (
        <InputNumber
          placeholder="Tax %"
          min={0}
          max={100}
          style={{ width: "100%" }}
        />
      ),
    }
  ];
  const columns = [
    { title: "Name", dataIndex: "category_name", key: "category_name" },
    { title: "HSN Code", dataIndex: "hsn_code", key: "hsn_code" },
     { title: "Tax Percentage", dataIndex: "tax_percentage", key: "tax_percentage" },
  ];

  const apiRoutes = {
    get: getApiRouteCategory("GetAll"),
    create: getApiRouteCategory("Create"),
    update: getApiRouteCategory("Update"),
    delete: getApiRouteCategory("Delete"),
  };

  return (
    <CrudModule
      title="Categories"
      formItems={formItems}
      columns={columns}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default CategoryCrud;
