import React, { useEffect } from "react";
import { Input, Select } from "antd";
import { Option } from "antd/es/mentions";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import { GenericCrudPage } from "../../components/common/GenericCrudPage";
import { Variant } from "../../types/entities";
import { getEntityApiRoutes } from "../../helpers/CrudFactory";

const VariantCrud: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const UnitsApi = getEntityApi("Unit");
  const { items: unitItems, loading: unit_get_loading } = useDynamicSelector(
    UnitsApi.getIdentifier("GetAll")
  );

  useEffect(() => {
    UnitsApi("GetAll");
  }, [UnitsApi]);

  const variantConfig = {
    title: "Variants",
    columns: [
      { title: "Name", dataIndex: "variant_name", key: "variant_name" },
      { title: "Unit Type", dataIndex: "unit", key: "unit" },
      { title: "Pack Size", dataIndex: "pack_size", key: "pack_size" },
      { title: "Pack Type", dataIndex: "pack_type", key: "pack_type" },
    ],
    formItems: [
      {
        label: "Variant Name",
        name: "variant_name",
        rules: [{ required: true, message: "Please enter variant name" }],
        component: <Input placeholder="e.g., 1kg, 500ml, 10pcs" />,
      },
      {
        label: "Unit Type",
        name: "unit",
        rules: [{ required: true, message: "Please select unit" }],
        component: (
          <Select
            placeholder="Select unit"
            loading={unit_get_loading}
            showSearch
            allowClear
          >
            {(unitItems?.result || []).map((unit: any) => (
              <Option key={unit._id} value={unit.unit_code}>
                {unit.unit_name}
              </Option>
            ))}
          </Select>
        ),
      },
      {
        label: "Pack Type",
        name: "pack_type",
        rules: [{ required: true, message: "Please select pack type" }],
        component: (
          <Select placeholder="Select pack type">
            <Option value="strip">Strip</Option>
            <Option value="bottle">Bottle</Option>
            <Option value="packet">Packet</Option>
            <Option value="box">Box</Option>
            <Option value="pouch">Pouch</Option>
            <Option value="pack">Pack</Option>
          </Select>
        ),
      },
      {
        label: "Pack Size",
        name: "pack_size",
        rules: [{ required: true, message: "Enter number of items in pack" }],
        component: (
          <Input
            type="number"
            placeholder="e.g., 15 (for 15 tablets in a strip)"
          />
        ),
      },
    ],
    apiRoutes: getEntityApiRoutes("Variant"),
    formColumns: 2,
  };

  return <GenericCrudPage config={variantConfig} />;
};

export default VariantCrud;
