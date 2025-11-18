import React, { useMemo } from "react";
import { Input, Select, Switch, Tag } from "antd";
import { CheckCircleTwoTone } from '@ant-design/icons';
import { Option } from "antd/es/mentions";
import { GenericCrudPage } from "../../components/common/GenericCrudPage";
import { Variant } from "../../types/entities";
import { getCurrentUserRole } from "../../helpers/auth";
import { apiSlice } from '../../services/redux/api/apiSlice';
import { useInfiniteDropdown } from "../../hooks/useInfiniteDropdown";
import BusinessTypeSelect from "../../components/common/BusinessTypeSelect";

const VariantCrud: React.FC = () => {
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

  // Use infinite scroll for Unit dropdown
  const unitDropdown = useInfiniteDropdown({
    queryHook: apiSlice.useGetUnitQuery,
    limit: 20,
    searchFields: ['unit_name'],
  });

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
      }] : [
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
        }
      ]),
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
            loading={unitDropdown.loading && unitDropdown.items.length === 0}
            showSearch
            allowClear
            onSearch={unitDropdown.setSearchString}
            onPopupScroll={unitDropdown.handlePopupScroll}
            onDropdownVisibleChange={unitDropdown.onDropdownVisibleChange}
            filterOption={false}
            notFoundContent={
              unitDropdown.loading ? 'Loading units...' : 
              unitDropdown.items.length === 0 ? 'No units found' : 
              null
            }
            dropdownRender={(menu) => (
              <>
                {menu}
                {unitDropdown.hasMore && unitDropdown.items.length > 0 && (
                  <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                    {unitDropdown.loading ? 'Loading...' : 'Scroll for more'}
                  </div>
                )}
              </>
            )}
          >
            {unitDropdown.items.map((unit: any) => (
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
          <BusinessTypeSelect placeholder="Select business type" allowClear />
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
    entityName: "Variant",
    formColumns: 2,
    searchFields: ['variant_name'],
    canEdit: (record: Variant) => {
      // If global_variant is true, only superadmin can edit
      if (record.global_variant) {
        return isSuperAdmin;
      }
      // Otherwise, all users can edit
      return true;
    },
    canDelete: (record: Variant) => {
      // If global_variant is true, only superadmin can delete
      if (record.global_variant) {
        return isSuperAdmin;
      }
      // Otherwise, all users can delete
      return true;
    },
  }), [unitDropdown, isSuperAdmin]);

  return (
    <GenericCrudPage 
      config={variantConfig}
      enableDynamicFields={true}
      entityName="variant"
    />
  );
};

export default VariantCrud;
