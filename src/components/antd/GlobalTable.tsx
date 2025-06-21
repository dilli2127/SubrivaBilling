import React, { memo } from 'react';
import { Table, TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './GlobalTable.css'; // Optional for custom styles

interface GlobalTableProps<T> extends TableProps<T> {
  columns: ColumnsType<T>;
  data: T[];
  rowKeyField?: string;
  bordered?: boolean;
  totalCount?: number;
  pageLimit?:number;
  onPaginationChange?: (page: number, pageSize: number) => void;
}

function GlobalTable<T extends object>({
  columns,
  data,
  rowKeyField = 'id',
  bordered = true,
  totalCount,
  onPaginationChange,
  pageLimit,
  ...rest
}: GlobalTableProps<T>) {
  return (
    <div className="custom-table-container">
      <Table
        columns={columns}
        dataSource={data}
        rowKey={rowKeyField}
        bordered={bordered}
        pagination={{
          pageSize: pageLimit,
          total: totalCount,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          onChange: onPaginationChange
        }}
        className="custom-table"
        {...rest}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}

export default memo(GlobalTable);
