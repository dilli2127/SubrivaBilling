import React, { useEffect } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { InputNumber, Select } from 'antd';
import { useDynamicSelector } from '../../services/redux';
import { useApiActions } from '../../services/api/useApiActions';
import { StockAuditList } from '../../types/entities';
const { Option } = Select;
const BranchStock: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const BranchApi = getEntityApi('Braches');
  const StockAuditApi = getEntityApi("StockAudit");
  const { items: branchList, loading: branchLoading } = useDynamicSelector(
    BranchApi.getIdentifier('GetAll')
  );
  const { items: StockAuditList, loading: stockAuditLoading } =
  useDynamicSelector(StockAuditApi.getIdentifier("GetAll"));
  const branchStockConfig = {
    title: 'Branch Stock',
    columns: [
      {
        title: 'Added Quantity',
        dataIndex: 'added_quantity',
        key: 'added_quantity',
      },
      {
        title: 'Available Quantity',
        dataIndex: 'available_quantity',
        key: 'available_quantity',
      },
    ],
    formItems: [
      {
        label: "Stock In Batch",
        name: "stock_audit_id",
        rules: [{ required: true, message: "Please select the stock batch" }],
        component: (
          <Select
            placeholder="Select category"
            loading={stockAuditLoading}
            showSearch
            allowClear
          >
            {(StockAuditList?.result || []).map((cat: StockAuditList<any>) => (
              <Option key={cat._id} value={cat._id}>
                {cat?.ProductItem?.name} -{" "}
                {cat?.ProductItem?.VariantItem?.variant_name} - {cat?.batch_no}
              </Option>
            ))}
          </Select>
        ),
      },
      {
        name: 'branch_id',
        label: 'Branch',
        rules: [{ required: true, message: 'Please select a branch' }],
        component: (
          <Select
            placeholder="Select branch"
            // loading={branchLoading}
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
        name: 'added_quantity',
        label: 'Quantity',
        rules: [{ required: true, message: 'Please enter quantity' }],
        component: <InputNumber min={1} style={{ width: '100%' }} />,
      },
    ],
    apiRoutes: getEntityApiRoutes('BranchStock'),
    formColumns: 2,
  };
  useEffect(() => {
    BranchApi('GetAll');
    StockAuditApi("GetAll")
  }, [BranchApi]);
  return <GenericCrudPage config={branchStockConfig} />;
};

export default BranchStock;
