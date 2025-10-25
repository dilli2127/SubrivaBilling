import React, { useMemo, useState, useCallback } from 'react';
import { Table, Button, Space, Popconfirm, message, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useGenericCrudRTK, RTKQueryParams } from '../../hooks/useGenericCrudRTK';
// Define EntityName type locally since it might not be exported from entities
type EntityName = string;

type ColumnType<T> = {
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: number;
  sorter?: boolean;
  filters?: { text: string; value: any }[];
  onFilter?: (value: any, record: T) => boolean;
};

interface VirtualizedTableProps<T> {
  entityName: EntityName;
  columns: ColumnType<T>[];
  height?: number;
  itemSize?: number;
  className?: string;
  showActions?: boolean;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onRefresh?: () => void;
  initialParams?: RTKQueryParams;
  enablePagination?: boolean;
  pageSize?: number;
}

const VirtualizedTable = <T extends Record<string, any>>({
  entityName,
  columns,
  height = 400,
  itemSize = 50,
  className,
  showActions = true,
  onEdit,
  onDelete,
  onRefresh,
  initialParams = {},
  enablePagination = true,
  pageSize = 10,
}: VirtualizedTableProps<T>) => {
  const [params, setParams] = useState<RTKQueryParams>({
    page: 1,
    limit: pageSize,
    ...initialParams,
  });

  // Use RTK hooks for data fetching
  const { useGetAll, useDelete } = useGenericCrudRTK(entityName);
  const { data, isLoading, isError, error, refetch } = useGetAll(params);
  const { delete: deleteRecord, isLoading: isDeleting } = useDelete();

  // Handle delete action
  const handleDelete = useCallback(async (record: T) => {
    try {
      const result = await deleteRecord(record.id);
      if (result.error) {
        message.error('Failed to delete record');
      } else {
        message.success('Record deleted successfully');
        refetch();
        onDelete?.(record);
      }
    } catch (error) {
      message.error('Failed to delete record');
    }
  }, [deleteRecord, refetch, onDelete]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
    onRefresh?.();
  }, [refetch, onRefresh]);

  // Handle table change (pagination, sorting, filtering)
  const handleTableChange = useCallback((pagination: any, filters: any, sorter: any) => {
    const newParams: RTKQueryParams = {
      ...params,
      page: pagination.current || 1,
      limit: pagination.pageSize || pageSize,
    };

    // Add sorting
    if (sorter && sorter.field) {
      newParams.sortBy = sorter.field;
      newParams.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    // Add filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].length > 0) {
        newParams[key] = filters[key];
      }
    });

    setParams(newParams);
  }, [params, pageSize]);

  // Add action column if showActions is true
  const memoizedColumns = useMemo(() => {
    const baseColumns = columns.map((column: ColumnType<T>) => ({
      ...column,
      title: column.title || 'Column',
    }));

    if (showActions) {
      baseColumns.push({
        title: 'Actions',
        dataIndex: 'actions' as keyof T,
        width: 120,
        render: (_: any, record: T) => (
          <Space size="small">
            {onEdit && (
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
            )}
            <Popconfirm
              title="Are you sure you want to delete this record?"
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={isDeleting}
              />
            </Popconfirm>
          </Space>
        ),
      });
    }

    return baseColumns;
  }, [columns, showActions, onEdit, handleDelete, isDeleting]);

  // Show error state
  if (isError) {
    return (
      <div style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'red', marginBottom: 16 }}>
          Error loading data: {error?.message || 'Unknown error'}
        </div>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          Retry
        </Button>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Extract data and pagination info from response
  const tableData = data?.result || [];
  const paginationInfo = data?.pagination || {};

  return (
    <div className={className}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{entityName} Records</h3>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>
      
      <Table
        dataSource={tableData}
        columns={memoizedColumns as any}
        pagination={enablePagination ? {
          current: params.page || 1,
          pageSize: params.limit || pageSize,
          total: paginationInfo.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        } : false}
        scroll={{ y: height - 100 }}
        size="small"
        bordered
        onChange={handleTableChange}
        loading={isLoading}
        rowKey="id"
      />
    </div>
  );
};

export default VirtualizedTable;
