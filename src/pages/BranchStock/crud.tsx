import React, { useEffect } from 'react';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import {
  Badge,
  InputNumber,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useDynamicSelector } from '../../services/redux';
import { useApiActions } from '../../services/api/useApiActions';
import { StockAuditList } from '../../types/entities';
import {
  DollarOutlined,
  NumberOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
const { Option } = Select;
const { Text } = Typography;
const BranchStock: React.FC = () => {
  const { getEntityApi } = useApiActions();
  const BranchApi = getEntityApi('Braches');
  const StockAuditApi = getEntityApi('StockAudit');
  const { items: branchList, loading: branchLoading } = useDynamicSelector(
    BranchApi.getIdentifier('GetAll')
  );
  const { items: StockAuditList, loading: stockAuditLoading } =
    useDynamicSelector(StockAuditApi.getIdentifier('GetAll'));
  const branchStockConfig = {
    title: 'Branch Stock',
    columns: [
      {
        title: 'Invoice',
        dataIndex: ['StockAudit', 'invoice_id'],
        key: 'invoice_id',
        render: (text: string) => (
          <Tooltip title="Invoice ID">
            <Tag color="blue">{text}</Tag>
          </Tooltip>
        ),
      },
      {
        title: 'Added Qty',
        dataIndex: 'added_quantity',
        key: 'added_quantity',
        render: (qty: number) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShoppingCartOutlined style={{ color: '#1890ff' }} />
            <Text strong>{qty}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Pack(s)
            </Text>
          </div>
        ),
      },

      {
        title: 'Available',
        key: 'quantity',
        render: (_: any, record: any) => (
          <Space direction="vertical" size={0}>
            <Text>
              <strong>{record.available_quantity}</strong> Pack(s)
            </Text>
            <Text type="secondary">
              + {record.available_loose_quantity} Loose
            </Text>
          </Space>
        ),
      },

      {
        title: 'Sell Price',
        dataIndex: ['StockAudit', 'sell_price'],
        key: 'sell_price',
        render: (price: string) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <DollarOutlined style={{ color: '#faad14' }} />
            <Text>₹ {parseFloat(price).toFixed(2)}</Text>
          </div>
        ),
      },
      {
        title: 'Payment',
        dataIndex: ['StockAudit', 'payment_status'],
        key: 'payment_status',
        render: (status: string) => {
          const color =
            status === 'paid'
              ? 'green'
              : status === 'pending'
                ? 'orange'
                : 'volcano';
          return (
            <Tag color={color} style={{ fontWeight: 500 }}>
              {status.toUpperCase()}
            </Tag>
          );
        },
      },
    ],
    formItems: [
      {
        label: 'Stock In Batch',
        name: 'stock_audit_id',
        rules: [{ required: true, message: 'Please select the stock batch' }],
        component: (
          <Select
            placeholder="Select category"
            loading={stockAuditLoading}
            showSearch
            allowClear
          >
            {(StockAuditList?.result || []).map((cat: StockAuditList<any>) => (
              <Option key={cat._id} value={cat._id}>
                {cat?.ProductItem?.name} -{' '}
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
    StockAuditApi('GetAll');
  }, [BranchApi]);
  return <GenericCrudPage config={branchStockConfig} />;
};

export default BranchStock;
