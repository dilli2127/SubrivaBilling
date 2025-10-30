import React, { useEffect, useMemo, useState } from "react";
import { Form, Button } from "antd";
import GlobalDrawer from "../../components/antd/GlobalDrawer";
import { revertDrawerFormItems } from "./RevertDrawerFormItems";
import { apiSlice } from "../../services/redux/api/apiSlice";

interface RevertDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  record: any;
  branchList: any;
  branchLoading: boolean;
  loading:boolean
}

const RevertDrawer: React.FC<RevertDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  record,
  branchList,
  branchLoading,
  loading
}) => {
  const [form] = Form.useForm();
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const watchedBranchId = Form.useWatch('branch_id', form);

  useEffect(() => {
    if (watchedBranchId) {
      setSelectedBranchId(watchedBranchId);
    }
  }, [watchedBranchId]);

  // Fetch branch stock for the selected branch + current product/batch
  const queryParams = useMemo(() => ({
    branch_id: selectedBranchId,
    stock_audit_id: record?._id,
  }), [selectedBranchId, record]);

  const { data: branchStockData } = apiSlice.useGetBranchStockQuery(queryParams, {
    skip: !open || !selectedBranchId || !record?.ProductItem?._id,
    refetchOnMountOrArgChange: true,
  } as any);

  const availableQty: number = useMemo(() => {
    const list = (branchStockData as any)?.result || [];
    if (!Array.isArray(list)) return 0;
    // Strictly match by branch, product and batch of the current record
    const currentProductId = record?.ProductItem?._id;
    const currentBatch = record?.batch_no;
    const currentBranch = selectedBranchId;
    return list
      .filter((item: any) => {
        const matchesBranch = !currentBranch || item?.branch_id === currentBranch || item?.Branch?._id === currentBranch;
        const matchesProduct = !currentProductId || item?.product === currentProductId || item?.ProductItem?._id === currentProductId;
        const matchesBatch = !currentBatch || item?.batch_no === currentBatch;
        return matchesBranch && matchesProduct && matchesBatch;
      })
      .reduce((sum: number, item: any) => sum + (Number(item?.available_quantity) || 0), 0);
  }, [branchStockData, record, selectedBranchId]);

  const formItems = revertDrawerFormItems(
    branchList,
    branchLoading,
    record,
    {
      onBranchChange: (id: string) => {
        setSelectedBranchId(id);
      },
      availableQuantity: availableQty,
      maxQuantity: availableQty,
    }
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedBranchId(undefined);
    }
  }, [open, form, record]);

  return (
    <GlobalDrawer
      title="Revert Stock"
      open={open}
      onClose={onClose}
      width={400}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{}}>
        {formItems.map(item => (
          item.name === 'available_stock' ? (
            <Form.Item key={item.name as any} label={item.label}>
              {item.component}
            </Form.Item>
          ) : (
            <Form.Item key={item.name as any} name={item.name as any} label={item.label} rules={item.rules}>
              {item.component}
            </Form.Item>
          )
        ))}
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} disabled={loading}>
            Revert
          </Button>
        </Form.Item>
      </Form>
    </GlobalDrawer>
  );
};

export default RevertDrawer; 