import React, { useMemo } from 'react';
import { Button, Table, Space, Popconfirm, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FieldMetadata } from '../../hooks/useFieldMetadata';
import { FIELD_TYPE_OPTIONS } from '../../helpers/fieldMetadataUtils';
import { FieldsTableProps } from './types';

const FieldsTable: React.FC<FieldsTableProps> = ({
  data,
  loading,
  deleteLoading,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnsType<FieldMetadata> = useMemo(
    () => [
      {
        title: 'Label',
        dataIndex: 'label',
        key: 'label',
        sorter: (a, b) => a.label.localeCompare(b.label),
      },
      {
        title: 'Field Name',
        dataIndex: 'field_name',
        key: 'field_name',
        render: (text: string) => <Tag color="blue">{text}</Tag>,
      },
      {
        title: 'Type',
        dataIndex: 'field_type',
        key: 'field_type',
        render: (text: string) => <Tag color="cyan">{text}</Tag>,
        filters: FIELD_TYPE_OPTIONS.map(opt => ({ text: opt.label, value: opt.value })),
        onFilter: (value, record) => record.field_type === value,
      },
      {
        title: 'Required',
        dataIndex: 'is_required',
        key: 'is_required',
        render: (value: boolean) => (
          <Tag color={value ? 'red' : 'default'}>{value ? 'Yes' : 'No'}</Tag>
        ),
        filters: [
          { text: 'Required', value: true },
          { text: 'Optional', value: false },
        ],
        onFilter: (value, record) => record.is_required === value,
      },
      {
        title: 'Active',
        dataIndex: 'is_active',
        key: 'is_active',
        render: (value: boolean) => (
          <Tag color={value ? 'green' : 'default'}>{value ? 'Yes' : 'No'}</Tag>
        ),
        filters: [
          { text: 'Active', value: true },
          { text: 'Inactive', value: false },
        ],
        onFilter: (value, record) => record.is_active === value,
      },
      {
        title: 'Order',
        dataIndex: 'display_order',
        key: 'display_order',
        sorter: (a, b) => a.display_order - b.display_order,
        width: 80,
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        fixed: 'right',
        render: (_: any, record: FieldMetadata) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
            <Popconfirm
              title="Delete this field?"
              description="This action cannot be undone."
              onConfirm={() => onDelete(record._id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoading}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [onEdit, onDelete, deleteLoading]
  );

  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={loading}
      rowKey="_id"
      pagination={{ pageSize: 10, showSizeChanger: true }}
      size="middle"
      scroll={{ x: 900 }}
    />
  );
};

export default React.memo(FieldsTable);

