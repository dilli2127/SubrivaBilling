import React from "react";
import { Select, InputNumber } from "antd";
import { InfiniteDropdownResult } from "../../hooks/useInfiniteDropdown";

const { Option } = Select;

export const storageAllocateDrawerFormItems = (
  rackDropdown: InfiniteDropdownResult
) => [
  {
    name: "rack_id",
    label: "Rack",
    rules: [{ required: true, message: "Please select a rack" }],
    component: (
      <Select
        placeholder="Select rack"
        loading={rackDropdown.loading && rackDropdown.items.length === 0}
        showSearch
        allowClear
        onSearch={rackDropdown.setSearchString}
        onPopupScroll={rackDropdown.handlePopupScroll}
        onDropdownVisibleChange={rackDropdown.onDropdownVisibleChange}
        filterOption={false}
        notFoundContent={
          rackDropdown.loading ? 'Loading racks...' : 
          rackDropdown.items.length === 0 ? 'No racks found' : 
          null
        }
        dropdownRender={(menu) => (
          <>
            {menu}
            {rackDropdown.hasMore && rackDropdown.items.length > 0 && (
              <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                {rackDropdown.loading ? 'Loading...' : 'Scroll for more'}
              </div>
            )}
          </>
        )}
      >
        {rackDropdown.items.map((rack: any) => (
          <Option key={rack._id} value={rack._id}>
            {rack.name}
          </Option>
        ))}
      </Select>
    ),
  },
  {
    name: "storage_quantity",
    label: "Storage Quantity",
    rules: [{ required: true, message: "Please enter quantity" }],
    component: <InputNumber min={1} style={{ width: "100%" }} />,
  },
  // {
  //   name: "loose_quantity",
  //   label: "Loose Quantity",
  //   rules: [{ required: true, message: "Please enter loose quantity" }],
  //   component: <InputNumber min={0} style={{ width: "100%" }} />,
  // },
]; 