// pages/unit/UnitCrud.tsx

import React from "react";
import CrudModule from "../../components/common/CrudModule";
import { getApiRouteUnit } from "../../helpers/Common_functions";
import { Input } from "antd";

const UnitCrud = () => {
  const formItems = [
    {
      label: "Unit Name",
      name: "unit_name",
      rules: [{ required: true, message: "Please enter the unit name!" }],
      component: <Input placeholder="e.g. Piece, Kg, Box" />,
    },
    {
      label: "Short Code",
      name: "unit_code",
      rules: [{ required: true, message: "Please enter unit short code!" }],
      component: <Input placeholder="e.g. pcs, kg, box" />,
    },
  ];
  const columns = [
    { title: "Unit Name", dataIndex: "unit_name", key: "unit_name" },
    { title: "Unit Code", dataIndex: "unit_code", key: "unit_code" },
  ];

  const apiRoutes = {
    get: getApiRouteUnit("Get"),
    create: getApiRouteUnit("Create"),
    update: getApiRouteUnit("Update"),
    delete: getApiRouteUnit("Delete"),
  };

  return (
    <CrudModule
      title="Units"
      formItems={formItems}
      columns={columns}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default UnitCrud;
