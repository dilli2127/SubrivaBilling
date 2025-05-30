import React from 'react';
import { Table, TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './GlobalTable.css'; // Optional for custom styles

interface GlobalTableProps<T> extends TableProps<T> {
  columns: ColumnsType<T>;
  data: T[];
  rowKeyField?: string;
  bordered?: boolean;
}

function GlobalTable<T extends object>({
  columns,
  data,
  rowKeyField = 'id',
  bordered = true,
  ...rest
}: GlobalTableProps<T>) {
  return (
    <div className="custom-table-container">
      <Table
        columns={columns}
        dataSource={data}
        rowKey={rowKeyField}
        bordered={bordered}
        pagination={{ pageSize: 10 }}
        className="custom-table"
        {...rest}
      />
    </div>
  );
}

export default GlobalTable;
