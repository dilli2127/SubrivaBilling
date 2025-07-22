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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
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

  // Keyboard shortcuts
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
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [data, allowAdd, onSave]);

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
    const inputRef = useRef<any>(null);
    const column = columns[col];

    useEffect(() => {
      setCellValue(value);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }, [value]);

    const handleChange = (newValue: any) => {
      setCellValue(newValue);
      saveCell(row, col, newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const nextCol = e.shiftKey ? col - 1 : col + 1;
        const nextRow = row + (nextCol >= columns.length ? 1 : 0);
        const colIndex = (nextCol + columns.length) % columns.length;

        if (nextRow < data.length) {
          setEditingCell({ row: nextRow, col: colIndex });
        } else if (allowAdd && onAdd) {
          handleAddRow();
          setEditingCell({ row: data.length, col: colIndex });
        }
      } else if (e.key === "Escape") {
        setEditingCell(null);
      }
    };

    let inputNode: React.ReactNode;
    switch (column.type) {
      case "number":
        inputNode = (
          <InputNumber
            ref={inputRef}
            value={cellValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{ width: "100%" }}
          />
        );
        break;
      case "select":
        inputNode = (
          <Select
            ref={inputRef}
            value={cellValue}
            options={column.options}
            onChange={handleChange}
            open
            style={{ width: "100%" }}
            onKeyDown={handleKeyDown}
          />
        );
        break;
      case "date":
        inputNode = (
          <DatePicker
            ref={inputRef}
            value={cellValue ? dayjs(cellValue) : null}
            onChange={(date) =>
              handleChange(date ? date.format("YYYY-MM-DD") : null)
            }
            format="YYYY-MM-DD"
            onKeyDown={handleKeyDown}
            style={{ width: "100%" }}
          />
        );
        break;
      default:
        inputNode = (
          <Input
            ref={inputRef}
            value={cellValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        );
    }

    return <div>{inputNode}</div>;
  };

  const mergedColumns = columns.map((col, colIndex) => ({
    ...col,
    onCell: (_record: any, rowIndex?: number) => ({
      onClick: () =>
        typeof rowIndex === "number" && setEditingCell({ row: rowIndex, col: colIndex }),
      "data-column-key": col.dataIndex,
    }),
    render: (_value: any, record: any, rowIndex: number) => {
      const isEditing =
        editingCell &&
        editingCell.row === rowIndex &&
        editingCell.col === colIndex;
      if (isEditing) {
        return (
          <EditableCell
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            col={colIndex}
            value={record[col.dataIndex]}
          />
        );
      }
      const value = record[col.dataIndex];
      if (col.type === "date") {
        return value ? dayjs(value).format("YYYY-MM-DD") : "";
      }
      if (col.type === "select") {
        return col.options?.find((opt) => opt.value === value)?.label || value;
      }
      return value;
    },
  }));

  return (
    <div ref={tableRef} className={`editable-table ${className || ""}`}>
      <Space style={{ marginBottom: 8 }}>
        {allowAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow}>
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
    </div>
  );
};

export default AntdEditableTable;
