import { Select, InputNumber, Input } from "antd";

const { Option } = Select;

export const allocateDrawerFormItems = (
  branchList: any,
  branchLoading: boolean
) => [
  {
    name: "branch_id",
    label: "Branch",
    rules: [{ required: true, message: "Please select a branch" }],
    component: (
      <Select
        placeholder="Select branch"
        loading={branchLoading}
        showSearch
        optionFilterProp="children"
      >
        {branchList?.result?.map((branch: any) => (
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