import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Space,
  Modal,
  Typography,
  message,
} from "antd";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./AntdEditableTable.css";

const { Text } = Typography;

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
  compact?: boolean;
  enableKeyboardNav?: boolean;
  size?: SizeType;
  className?: string;
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
  compact = false,
  enableKeyboardNav = true,
  size = "middle",
  className,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    setData(dataSource);

    const firstProductColIndex = columns.findIndex(
      (col) => col.dataIndex === "product_id"
    );

    // ✅ Auto-focus only if table is empty on first load
    if (
      firstLoadRef.current &&
      dataSource.length === 0 &&
      firstProductColIndex >= 0
    ) {
      setEditingCell({ row: 0, col: firstProductColIndex });
      firstLoadRef.current = false; // Prevent repeat auto-focus
    }
  }, [dataSource, columns]);

  const handleAddRow = () => {
    const newRow: any = { [rowKey]: Date.now().toString() };
    columns.forEach((col) => {
      newRow[col.dataIndex] = col.defaultValue ?? "";
    });
    const newData = [...data, newRow];
    setData(newData);
    onSave(newData);
    onAdd?.();
    
    // Auto-focus the first editable column in the new row
    const firstEditableColIndex = columns.findIndex(col => col.editable !== false);
    if (firstEditableColIndex >= 0) {
      setTimeout(() => {
        setEditingCell({ row: newData.length - 1, col: firstEditableColIndex });
      }, 100);
    }
  };

  const handleDeleteRow = () => {
    if (data.length === 0) {
      message.warning("No rows to delete");
      return;
    }
    Modal.confirm({
      title: "Delete the last row?",
      onOk: () => {
        const newData = data.slice(0, -1);
        setData(newData);
        onSave(newData);
        onDelete?.([data.length - 1]);
      },
    });
  };

  const saveCell = (row: number, col: number, value: any): boolean => {
    const column = columns[col];
    
    // Basic validation
    if (column.required && (!value || value === "")) {
      message.error(`${column.title} is required`);
      return false;
    }
    
    // Custom validation
    if (column.validation) {
      const error = column.validation(value);
      if (error) {
        message.error(error);
        return false;
      }
    }
    
    const newData = [...data];
    newData[row][columns[col].dataIndex] = value;
    setData(newData);
    onSave(newData);
    return true;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        onSave(data);
      }
      if (e.shiftKey && e.key.toLowerCase() === "a" && allowAdd) {
        e.preventDefault();
        handleAddRow();
      }
    };
    if (enableKeyboardNav) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [data, allowAdd, onSave, enableKeyboardNav, handleAddRow]);

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
    const inputRef = useRef<any>(null);
    const column = columns[col];

    useEffect(() => {
      setCellValue(value);
      // ✅ Focus input/select when cell enters edit mode
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }, [value]);

    const handleChange = (val: any) => {
      setCellValue(val);
      saveCell(row, col, val);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const nextCol = e.shiftKey ? col - 1 : col + 1;
        const nextRow = row + (nextCol >= columns.length ? 1 : 0);
        const colIndex = (nextCol + columns.length) % columns.length;
        
        // Validate current cell before moving
        const column = columns[col];
        if (column.required && (!cellValue || cellValue === "")) {
          message.error(`${column.title} is required`);
          return;
        }
        
        if (nextRow < data.length) {
          setEditingCell({ row: nextRow, col: colIndex });
        } else if (allowAdd) {
          handleAddRow();
          setEditingCell({ row: data.length, col: colIndex });
        }
      } else if (e.key === "Escape") {
        setEditingCell(null);
      }
    };

    switch (column.type) {
      case "number":
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <InputNumber
              ref={inputRef}
              value={cellValue}
              onChange={handleChange}
              onBlur={() => setEditingCell(null)}
              onKeyDown={handleKeyDown}
              style={{ width: "100%" }}
            />
          </div>
        );
        case "select":
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Select
                ref={inputRef}
                value={cellValue}
                options={column.options}
                onChange={(val) => {
                  const success = saveCell(row, col, val);
                  if (success) {
                    // Move to next editable cell
                    const nextCol = col + 1;
                    const nextRow = row + (nextCol >= columns.length ? 1 : 0);
                    const colIndex = (nextCol + columns.length) % columns.length;
        
                    if (nextRow < data.length) {
                      setEditingCell({ row: nextRow, col: colIndex });
                    } else if (allowAdd) {
                      handleAddRow();
                      setEditingCell({ row: data.length, col: colIndex });
                    }
                  } else {
                    // Validation failed; keep focus
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 50);
                  }
                }}
                style={{ width: "100%" }}
                open
                // Prevent Enter key double-validation
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault(); // Block default key behavior
                  }
                }}
              />
            </div>
          );
        
      case "date":
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DatePicker
              ref={inputRef}
              value={cellValue ? dayjs(cellValue) : null}
              onChange={(date) => {
                handleChange(date ? date.format("YYYY-MM-DD") : null);
                setEditingCell(null);
              }}
              onBlur={() => setEditingCell(null)}
              onKeyDown={handleKeyDown}
              style={{ width: "100%" }}
            />
          </div>
        );
      default:
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Input
              ref={inputRef}
              value={cellValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={() => setEditingCell(null)}
              onKeyDown={handleKeyDown}
            />
          </div>
        );
    }
  };

  const mergedColumns = columns.map((col, colIndex) => ({
    ...col,
    onCell: (_record: any, rowIndex?: number) => ({
      onClick: () => {
        if (typeof rowIndex === "number") {
          setEditingCell({ row: rowIndex, col: colIndex });
        }
      },
             onContextMenu: (e: React.MouseEvent) => {
         e.preventDefault(); // ✅ Prevent default context menu
         if (typeof rowIndex === "number") {
           setEditingCell({ row: rowIndex, col: colIndex });
         }
       },
    }),
    render: (_val: any, record: any, rowIndex: number) => {
      if (
        editingCell &&
        editingCell.row === rowIndex &&
        editingCell.col === colIndex
      ) {
        return (
          <EditableCell
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            col={colIndex}
            value={record[col.dataIndex]}
          />
        );
      }
      if (col.type === "select" && col.options) {
        const option = col.options.find(
          (opt) => opt.value === record[col.dataIndex]
        );
        return option ? option.label : record[col.dataIndex];
      }
      return record[col.dataIndex];
    },
  }));

  return (
    <div
      className={`antd-editable-table ${compact ? "compact" : ""} ${
        className || ""
      }`}
    >
      <div className="table-toolbar">
        <Space>
          {allowAdd && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddRow}
            >
              Add Row (Shift+A)
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
        <Text type="secondary" className="table-info">
          Use Tab / Shift+Tab to navigate cells
        </Text>
      </div>
      <Table
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowKey={rowKey}
        loading={loading}
        pagination={false}
        size={size}
        scroll={{ y: 400 }}
      />
    </div>
  );
};

export default AntdEditableTable;
