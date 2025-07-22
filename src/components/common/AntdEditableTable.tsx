import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Typography,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import "./AntdEditableTable.css";

const { Text } = Typography;

// Column type
export interface AntdEditableColumn {
  title: string;
  dataIndex: string;
  key?: string;
  defaultValue?: any;
  type?: "text" | "number" | "select" | "date";
  options?: { label: string; value: any }[];
  required?: boolean;
  width?: number;
  editable?: boolean;
  validation?: (value: any) => string | undefined;
}

// Props
export interface AntdEditableTableProps {
  columns: AntdEditableColumn[];
  dataSource: any[];
  onSave: (data: any[]) => void;
  onAdd?: () => void;
  onDelete?: (indices: number[]) => void;
  allowAdd?: boolean;
  allowDelete?: boolean;
  rowKey?: string;
  loading?: boolean;
  size?: "small" | "middle" | "large";
  className?: string;
  enableAdvancedKeyboardNav?: boolean;
}

const AntdEditableTable: React.FC<AntdEditableTableProps> = ({
  columns,
  dataSource,
  onSave,
  onAdd,
  onDelete,
  allowAdd = true,
  allowDelete = true,
  rowKey = "key",
  loading = false,
  size = "small",
  className,
  enableAdvancedKeyboardNav = true,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(dataSource);
  }, [dataSource]);

  useEffect(() => {
    if (!enableAdvancedKeyboardNav) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only act if focus is inside this table
      if (!tableRef.current || !tableRef.current.contains(document.activeElement)) return;
      // Helper: get column keys
      const columnKeys = columns.map(col => col.dataIndex);
      // Helper: get first editable column key
      const firstEditableCol = columns.find(col => col.editable !== false)?.dataIndex || columnKeys[0];
      // Helper: get last editable column key
      const lastEditableCol = [...columns].reverse().find(col => col.editable !== false)?.dataIndex || columnKeys[columnKeys.length - 1];
      // Helper: get cell by row/col key
      const getCell = (rowKeyVal: string, colKey: string) =>
        tableRef.current?.querySelector(`td[data-row-key="${rowKeyVal}"][data-column-key="${colKey}"]`) as HTMLElement;
      // Helper: get current cell info
      const active = document.activeElement as HTMLElement;
      const currentCell = active?.closest('td[data-row-key]');
      const currentRowKey = currentCell?.getAttribute('data-row-key');
      const currentColKey = currentCell?.getAttribute('data-column-key');
      const currentRow = currentCell?.closest('tr');
             // F-key shortcuts
       if (e.key === 'F1' && onAdd) {
         e.preventDefault();
         onAdd();
         setTimeout(() => {
           // Focus first cell in new row
           const rows = tableRef.current?.querySelectorAll('.ant-table-tbody tr');
           if (rows && rows.length > 0) {
             const lastRow = rows[rows.length - 1];
             const firstCell = lastRow.querySelector(`td[data-column-key="${firstEditableCol}"]`) as HTMLElement;
             firstCell?.focus();
           }
         }, 100);
       } else if (e.key === 'F2') {
         e.preventDefault();
         onSave(data);
       } else if (e.key === 'F3' || e.key === 'F4') {
         // Let parent component handle F3 and F4
         return;
       } else if (e.key === 'F5' && onAdd) {
         e.preventDefault();
         for (let i = 0; i < 5; i++) onAdd();
       }
      // Ctrl shortcuts
      else if (e.ctrlKey) {
        if (e.key === 's') {
          e.preventDefault();
          onSave(data);
        } else if (e.key === 'n' && onAdd) {
          e.preventDefault();
          onAdd();
        }
      }
      // Tab/ArrowRight navigation
      else if (e.key === 'Tab' || e.key === 'ArrowRight') {
        if (currentCell && currentRowKey && currentColKey) {
          e.preventDefault();
          const colIdx = columnKeys.indexOf(currentColKey);
          let nextColIdx = e.shiftKey ? colIdx - 1 : colIdx + 1;
          let nextRow = currentRow as HTMLTableRowElement | null;
          let nextRowKey = currentRowKey;
          // Move to next/prev row if at end/start
          if (nextColIdx < 0) {
            nextColIdx = columnKeys.length - 1;
            nextRow = currentRow?.previousElementSibling as HTMLTableRowElement;
            nextRowKey = nextRow?.getAttribute('data-row-key') || '';
          } else if (nextColIdx >= columnKeys.length) {
            nextColIdx = 0;
            nextRow = currentRow?.nextElementSibling as HTMLTableRowElement;
            nextRowKey = nextRow?.getAttribute('data-row-key') || '';
            // If no next row, add new row if allowed
            if (!nextRow && allowAdd && onAdd) {
              onAdd();
              setTimeout(() => {
                const rows = tableRef.current?.querySelectorAll('.ant-table-tbody tr');
                if (rows && rows.length > 0) {
                  const lastRow = rows[rows.length - 1];
                  const firstCell = lastRow.querySelector(`td[data-column-key="${firstEditableCol}"]`) as HTMLElement;
                  firstCell?.focus();
                }
              }, 200);
              return;
            }
          }
          // Focus next cell
          const nextColKey = columnKeys[nextColIdx];
          const nextCell = getCell(nextRowKey, nextColKey);
          nextCell?.focus();
        }
      }
      // ArrowUp/ArrowDown navigation
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (currentCell && currentRowKey && currentColKey) {
          e.preventDefault();
          const row = currentRow as HTMLTableRowElement | null;
          let targetRow: HTMLTableRowElement | null = null;
          if (e.key === 'ArrowDown') {
            targetRow = row?.nextElementSibling as HTMLTableRowElement;
            if (!targetRow && allowAdd && onAdd) {
              onAdd();
              setTimeout(() => {
                const rows = tableRef.current?.querySelectorAll('.ant-table-tbody tr');
                if (rows && rows.length > 0) {
                  const lastRow = rows[rows.length - 1];
                  const cell = lastRow.querySelector(`td[data-column-key="${currentColKey}"]`) as HTMLElement;
                  cell?.focus();
                }
              }, 200);
              return;
            }
          } else if (e.key === 'ArrowUp') {
            targetRow = row?.previousElementSibling as HTMLTableRowElement;
          }
          if (targetRow) {
            const cell = targetRow.querySelector(`td[data-column-key="${currentColKey}"]`) as HTMLElement;
            if (cell) {
              cell.focus();
            } else {
              // Fallback to first editable cell
              const fallback = targetRow.querySelector(`td[data-column-key="${firstEditableCol}"]`) as HTMLElement;
              fallback?.focus();
            }
          }
        }
      }
      // ESC to blur
      else if (e.key === 'Escape') {
        const active = document.activeElement as HTMLElement;
        active?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableAdvancedKeyboardNav, columns, data, allowAdd, onAdd, onSave]);

  // Focus and edit a cell
  const focusCell = (row: number, col: number) => {
    const colCount = columns.length;
    const rowCount = data.length;

    // Clamp row/col within bounds
    if (row < 0) row = 0;
    if (col < 0) col = 0;
    if (row >= rowCount) {
      if (allowAdd) {
        handleAddRow();
        row = rowCount;
      } else {
        row = rowCount - 1;
      }
    }
    if (col >= colCount) col = colCount - 1;

    setEditingCell({ row, col });
  };

  // Add a new row
  const handleAddRow = () => {
    const newRow: any = { [rowKey]: Date.now().toString() };
    columns.forEach((col) => {
      newRow[col.dataIndex] = col.defaultValue || "";
    });
    const newData = [...data, newRow];
    setData(newData);
    onSave(newData);
    if (onAdd) onAdd();
  };

  // Delete last row
  const handleDeleteRow = () => {
    Modal.confirm({
      title: "Delete last row?",
      onOk: () => {
        const newData = data.slice(0, -1);
        setData(newData);
        onSave(newData);
        if (onDelete) onDelete([data.length - 1]);
      },
    });
  };

  // Save cell value
  const saveCell = (row: number, col: number, value: any) => {
    const newData = [...data];
    newData[row][columns[col].dataIndex] = value;
    setData(newData);
    onSave(newData);
  };

  // Navigation handler
  const handleKeyNavigation = (
    e: React.KeyboardEvent,
    row: number,
    col: number,
    value: any
  ) => {
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Tab"].includes(e.key)
    ) {
      e.preventDefault();
      saveCell(row, col, value);

      let nextRow = row;
      let nextCol = col;

      switch (e.key) {
        case "ArrowUp":
          nextRow--;
          break;
        case "ArrowDown":
        case "Enter":
          nextRow++;
          break;
        case "ArrowLeft":
          nextCol--;
          break;
        case "ArrowRight":
        case "Tab":
          nextCol += e.shiftKey ? -1 : 1;
          break;
      }

      // Wrap around rows/columns
      if (nextCol < 0) {
        nextCol = columns.length - 1;
        nextRow--;
      } else if (nextCol >= columns.length) {
        nextCol = 0;
        nextRow++;
      }

      focusCell(nextRow, nextCol);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  // Editable cell
  const EditableCell = ({
    row,
    col,
    value,
  }: {
    row: number;
    col: number;
    value: any;
  }) => {
    const [cellValue, setCellValue] = useState(value);

    useEffect(() => {
      setCellValue(value);
    }, [value]);

    return (
      <Input
        value={cellValue}
        onChange={(e) => setCellValue(e.target.value)}
        onBlur={() => saveCell(row, col, cellValue)}
        onKeyDown={(e) => handleKeyNavigation(e, row, col, cellValue)}
        autoFocus
      />
    );
  };

  const mergedColumns = columns.map((col, colIndex) => ({
    ...col,
    onCell: (_record: any, rowIndex?: number) => ({
      onClick: () => {
        if (typeof rowIndex === "number") setEditingCell({ row: rowIndex, col: colIndex });
      },
    }),
    render: (_value: any, record: any, rowIndex: number) => {
      if (
        editingCell &&
        editingCell.row === rowIndex &&
        editingCell.col === colIndex
      ) {
        return (
          <EditableCell
            row={rowIndex}
            col={colIndex}
            value={record[col.dataIndex]}
          />
        );
      }
      return record[col.dataIndex];
    },
  }));

  return (
    <div ref={tableRef} className={className}>
      <Space style={{ marginBottom: 8 }}>
        {allowAdd && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRow}
          >
            Add Row
          </Button>
        )}
        {allowDelete && (
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDeleteRow}
          >
            Delete Last Row
          </Button>
        )}
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => onSave(data)}
        >
          Save (Ctrl+S)
        </Button>
      </Space>
      <Table
        bordered
        size={size}
        dataSource={data}
        columns={mergedColumns}
        pagination={false}
        rowKey={rowKey}
        loading={loading}
        scroll={{ y: 400 }}
      />
      <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
        Excel Shortcuts: ⬅️➡️↕️ Navigate | Tab/Shift+Tab | Enter Add Row
      </Text>
    </div>
  );
};

export default AntdEditableTable;
