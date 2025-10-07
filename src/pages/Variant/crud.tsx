import React, { useEffect, useMemo } from "react";
import { Input, Select, Switch, Tag } from "antd";
import { CheckCircleTwoTone } from '@ant-design/icons';
import { Option } from "antd/es/mentions";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import { GenericCrudPage } from "../../components/common/GenericCrudPage";
import { Variant } from "../../types/entities";
import { getEntityApiRoutes } from "../../helpers/CrudFactory";
import { getCurrentUserRole } from "../../helpers/auth";

const VariantCrud: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const UnitsApi = getEntityApi("Unit");
  const { items: unitItems, loading: unit_get_loading } = useDynamicSelector(
    UnitsApi.getIdentifier("GetAll")
  );
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

  useEffect(() => {
    UnitsApi("GetAll");
  }, [UnitsApi]);

  const variantConfig = useMemo(() => ({
    title: "Variants",
    columns: [
      { title: "Name", dataIndex: "variant_name", key: "variant_name" },
      { title: "Unit Type", dataIndex: "unit", key: "unit" },
      { title: "Pack Size", dataIndex: "pack_size", key: "pack_size" },
      { title: "Pack Type", dataIndex: "pack_type", key: "pack_type" },
      ...(isSuperAdmin ? [{
        title: "Business Type",
        dataIndex: "business_type",
        key: "business_type",
        render: (businessType: string) => (
          <Tag color="blue">
            {businessType || '-'}
          </Tag>
        ),
      },
      {
        title: 'Global Variant',
        dataIndex: 'global_variant',
        key: 'global_variant',
        render: (globalVariant: boolean) => (
          globalVariant ? (
            <Tag
              icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
              color="success"
            >
              Yes
            </Tag>
          ) : (
            <Tag color="default">
              No
            </Tag>
          )
        ),
      }] : []),
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
      ...(isSuperAdmin ? [{
        label: "Business Type",
        name: "business_type",
        rules: [{ required: true, message: "Please select business type!" }],
        component: (
          <Select
            placeholder="Select business type"
            allowClear
          >
            <Option value="Supermarket / Grocery Store">Supermarket / Grocery Store</Option>
            <Option value="Medical / Pharmacy">Medical / Pharmacy</Option>
            <Option value="Hardware Store">Hardware Store</Option>
            <Option value="Hardware and Electronics Store">Hardware and Electronics Store</Option>
            <Option value="Electronics Store">Electronics Store</Option>
            <Option value="Stationery / Book Store">Stationery / Book Store</Option>
            <Option value="Clothing / Textile Store">Clothing / Textile Store</Option>
            <Option value="Footwear Store">Footwear Store</Option>
            <Option value="Bakery / Sweet Shop">Bakery / Sweet Shop</Option>
            <Option value="Fruits & Vegetables Shop">Fruits & Vegetables Shop</Option>
            <Option value="Furniture Store">Furniture Store</Option>
            <Option value="Automobile / Spare Parts">Automobile / Spare Parts</Option>
            <Option value="Mobile Accessories Store">Mobile Accessories Store</Option>
            <Option value="Cosmetics / Beauty Store">Cosmetics / Beauty Store</Option>
            <Option value="Jewellery / Fancy Store">Jewellery / Fancy Store</Option>
            <Option value="Pet Store">Pet Store</Option>
            <Option value="General Store">General Store</Option>
            <Option value="Wholesale Business">Wholesale Business</Option>
            <Option value="Computer & Laptop Store">Computer & Laptop Store</Option>
            <Option value="Mobile And Laptop Store">Mobile And Laptop Store</Option>
            <Option value="Electrical Store">Electrical Store</Option>
            <Option value="Restaurant / Café">Restaurant / Café</Option>
          </Select>
        ),
      },
      {
        label: 'Global Variant',
        name: 'global_variant',
        valuePropName: 'checked',
        component: (
          <Switch
            checkedChildren="Yes"
            unCheckedChildren="No"
            defaultChecked={false}
          />
        ),
      }] : []),
    ],
    apiRoutes: getEntityApiRoutes("Variant"),
    formColumns: 2,
  }), [unitItems, unit_get_loading, isSuperAdmin]);

  return <GenericCrudPage config={variantConfig} />;
};

export default VariantCrud;
