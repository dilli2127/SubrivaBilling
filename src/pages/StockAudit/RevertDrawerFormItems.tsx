import React from "react";
import { Select, InputNumber } from "antd";
import { InfiniteDropdownResult } from "../../hooks/useInfiniteDropdown";

const { Option } = Select;

export const revertDrawerFormItems = (
  branchDropdown: InfiniteDropdownResult,
  record: any,
  options: {
    onBranchChange: (branchId: string) => void;
    availableQuantity: number;
    maxQuantity?: number;
  }
) => [
  {
    name: "branch_id",
    label: "Branch",
    rules: [{ required: true, message: "Please select a branch" }],
    component: (
      <Select
        placeholder="Select branch"
        loading={branchDropdown.loading && branchDropdown.items.length === 0}
        showSearch
        allowClear
        onSearch={branchDropdown.setSearchString}
        onPopupScroll={branchDropdown.handlePopupScroll}
        onDropdownVisibleChange={branchDropdown.onDropdownVisibleChange}
        filterOption={false}
        onChange={options.onBranchChange}
        notFoundContent={
          branchDropdown.loading ? 'Loading branches...' : 
          branchDropdown.items.length === 0 ? 'No branches found' : 
          null
        }
        dropdownRender={(menu) => (
          <>
            {menu}
            {branchDropdown.hasMore && branchDropdown.items.length > 0 && (
              <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                {branchDropdown.loading ? 'Loading...' : 'Scroll for more'}
              </div>
            )}
          </>
        )}
      >
        {branchDropdown.items.map((branch: any) => (
          <Option key={branch._id} value={branch._id}>
            {branch.branch_name}
          </Option>
        ))}
      </Select>
    ),
  },
  {
    name: "available_stock",
    label: "Available Stock",
    rules: [{ required: false, message: "Please enter available stock" }],
    component: (
      <InputNumber
        min={1}
        style={{ width: "100%" }}
        disabled
        value={options.availableQuantity ?? record?.available_quantity ?? 0}
      />
    ),
  },
  {
    name: "quantity",
    label: "Quantity",
    rules: [{ required: true, message: "Please enter quantity" }],
    component: <InputNumber min={1} max={options.maxQuantity ?? options.availableQuantity} style={{ width: "100%" }} />,
  },
];