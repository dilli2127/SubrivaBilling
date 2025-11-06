import React from "react";
import { Select, InputNumber, Input } from "antd";
import { InfiniteDropdownResult } from "../../hooks/useInfiniteDropdown";

const { Option } = Select;

export const allocateDrawerFormItems = (
  branchDropdown: InfiniteDropdownResult
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
        filterOption={false}
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
    name: "added_quantity",
    label: "Quantity",
    rules: [{ required: true, message: "Please enter quantity" }],
    component: <InputNumber min={1} style={{ width: "100%" }} />,
  },
  {
    label: "Note",
    name: "note",
    rules: [],
    component: <Input.TextArea rows={3} placeholder="Optional notes" />,
  },
]; 