import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DataGrid, Column, RenderCellProps } from 'react-data-grid';
import { Button, Space, message, Modal, Select, Input, InputNumber, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import './EditableDataGrid.css';
import dayjs from 'dayjs';

export interface EditableColumn extends Omit<Column<any>, 'key'> {
  key: string;
  name: string;
  field: string;
  type?: 'text' | 'number' | 'select' | 'date' | 'boolean';
  options?: Array<{ label: string; value: any }>;
  required?: boolean;
  editable?: boolean;
  validation?: (value: any) => string | null;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
}

interface EditableDataGridProps {
  columns: EditableColumn[];
  data: any[];
  onSave: (rows: any[]) => void;
  onAdd?: () => void;
  onDelete?: (indices: number[]) => void;
  allowAdd?: boolean;
  allowDelete?: boolean;
  allowEdit?: boolean;
  height?: number;
  loading?: boolean;
  className?: string;
  rowHeight?: number;
  headerRowHeight?: number;
  keyboardNavigationMode?: 'CELL' | 'ROW';
}

const EditableDataGrid: React.FC<EditableDataGridProps> = ({
  columns,
  data,
  onSave,
  onAdd,
  onDelete,
  allowAdd = true,
  allowDelete = true,
  allowEdit = true,
  height = 400,
  loading = false,
  className = '',
  rowHeight = 35,
  headerRowHeight = 35,
  keyboardNavigationMode = 'CELL'
}) => {
  const [rows, setRows] = useState<any[]>(data);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const gridRef = useRef<any>(null);

  // Update rows when data prop changes
  useEffect(() => {
    setRows(data);
  }, [data]);

  // Custom cell editors
  const createEditor = (column: EditableColumn) => {
    return ({ row, onRowChange, onClose }: any) => {
      const value = row[column.field];
      


      const handleChange = (newValue: any) => {
        onRowChange({ ...row, [column.field]: newValue });
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
          onClose(true);
        } else if (e.key === 'Escape') {
          onClose();
        }
      };

      switch (column.type) {
        case 'select':
          return (
            <Select
              value={value || undefined}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              options={column.options || []}
              style={{ width: '100%' }}
              placeholder={`Select ${column.name}`}
              showSearch
              allowClear
              autoFocus
              onBlur={() => onClose(true)}
              onDropdownVisibleChange={(open) => {
                if (!open) onClose(true);
              }}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent="No options found"
            />
          );

        case 'number':
          return (
            <InputNumber
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              style={{ width: '100%' }}
              placeholder={`Enter ${column.name}`}
              autoFocus
              onBlur={() => onClose(true)}
            />
          );

        case 'date':
          return (
            <DatePicker
              value={value ? dayjs(value) : null}
              onChange={(date) => handleChange(date ? date.format('YYYY-MM-DD') : null)}
              onKeyDown={handleKeyDown}
              style={{ width: '100%' }}
              placeholder={`Select ${column.name}`}
              autoFocus
              onBlur={() => onClose(true)}
              onOpenChange={(open) => {
                if (!open) onClose(true);
              }}
            />
          );

        case 'boolean':
          return (
            <Select
              value={value || undefined}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              options={[
                { label: 'Yes', value: true },
                { label: 'No', value: false }
              ]}
              style={{ width: '100%' }}
              placeholder={`Select ${column.name}`}
              autoFocus
              onBlur={() => onClose(true)}
              onDropdownVisibleChange={(open) => {
                if (!open) onClose(true);
              }}
            />
          );

        default: // text
          return (
            <Input
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ width: '100%' }}
              placeholder={`Enter ${column.name}`}
              autoFocus
              onBlur={() => onClose(true)}
            />
          );
      }
    };
  };

  // Convert columns to react-data-grid format
  const gridColumns: Column<any>[] = columns.map((col) => ({
    key: col.field,
    name: col.name,
    width: col.width,
    minWidth: col.minWidth || 120,
    maxWidth: col.maxWidth,
    editable: allowEdit && (col.editable !== false),
    editor: col.editable !== false ? createEditor(col) : undefined,
    renderCell: ({ row }: RenderCellProps<any>) => {
      const value = row[col.field];
      
      // Handle empty values
      if (value === null || value === undefined || value === '') {
        if (col.type === 'select') {
          return <span style={{ color: '#999', fontStyle: 'italic' }}>{`Select ${col.name}`}</span>;
        }
        return <span style={{ color: '#999', fontStyle: 'italic' }}>{`Enter ${col.name}`}</span>;
      }
      
      if (col.type === 'date' && value) {
        return dayjs(value).format('YYYY-MM-DD');
      }
      if (col.type === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      if (col.type === 'select' && col.options) {
        const option = col.options.find(opt => opt.value === value);
        return option ? option.label : value;
      }
      return value || '';
    }
  }));

  // Add action column if delete is allowed
  if (allowDelete) {
    gridColumns.push({
      key: 'actions',
      name: 'Actions',
      width: 80,
      renderCell: ({ row }: RenderCellProps<any>) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRow(rows.indexOf(row))}
        />
      )
    });
  }

  const handleRowsChange = (newRows: any[]) => {
    setRows(newRows);
  };

  const handleAddRow = () => {
    if (onAdd) {
      onAdd();
    } else {
      const newRow: any = {};
      columns.forEach(col => {
        newRow[col.field] = col.type === 'number' ? 0 : col.type === 'boolean' ? false : '';
      });
      setRows([...rows, newRow]);
    }
  };

  const handleDeleteRow = (index: number) => {
    Modal.confirm({
      title: 'Delete Row',
      content: 'Are you sure you want to delete this row?',
      onOk: () => {
        if (onDelete) {
          onDelete([index]);
        } else {
          const newRows = rows.filter((_, i) => i !== index);
          setRows(newRows);
        }
      }
    });
  };

  const handleDeleteSelectedRows = () => {
    if (selectedRows.size === 0) {
      message.warning('Please select rows to delete');
      return;
    }

    Modal.confirm({
      title: 'Delete Selected Rows',
      content: `Are you sure you want to delete ${selectedRows.size} selected row(s)?`,
      onOk: () => {
        const indices = Array.from(selectedRows);
        if (onDelete) {
          onDelete(indices);
        } else {
          const newRows = rows.filter((_, index) => !selectedRows.has(index));
          setRows(newRows);
        }
        setSelectedRows(new Set());
      }
    });
  };

  const handleSave = () => {
    // Validate required fields
    const errors: string[] = [];
    rows.forEach((row, index) => {
      columns.forEach(col => {
        if (col.required && (!row[col.field] && row[col.field] !== 0)) {
          errors.push(`Row ${index + 1}: ${col.name} is required`);
        }
        if (col.validation) {
          const error = col.validation(row[col.field]);
          if (error) {
            errors.push(`Row ${index + 1}: ${error}`);
          }
        }
      });
    });

    if (errors.length > 0) {
      message.error('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    onSave(rows);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'n':
            if (allowAdd) {
              e.preventDefault();
              handleAddRow();
            }
            break;
          case 'd':
            if (allowDelete && selectedRows.size > 0) {
              e.preventDefault();
              handleDeleteSelectedRows();
            }
            break;
        }
      } else if (e.key === 'Delete' && allowDelete && selectedRows.size > 0) {
        e.preventDefault();
        handleDeleteSelectedRows();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [allowAdd, allowDelete, selectedRows]);

  return (
    <div className={`editable-data-grid ${className}`}>
      <div className="editable-data-grid-toolbar">
        <Space>
          {allowAdd && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddRow}
              size="small"
            >
              Add Row (Ctrl+N)
            </Button>
          )}
          {allowDelete && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteSelectedRows}
              disabled={selectedRows.size === 0}
              size="small"
            >
              Delete Selected (Del)
            </Button>
          )}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
            size="small"
          >
            Save (Ctrl+S)
          </Button>
        </Space>
        <div className="editable-data-grid-info">
          {selectedRows.size > 0 && `${selectedRows.size} row(s) selected`}
          {rows.length > 0 && ` | Total: ${rows.length} row(s)`}
        </div>
      </div>
      
      <DataGrid
        ref={gridRef}
        columns={gridColumns}
        rows={rows}
        onRowsChange={handleRowsChange}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        className="rdg-light"
        style={{ height }}
        rowHeight={rowHeight}
        headerRowHeight={headerRowHeight}
        defaultColumnOptions={{
          sortable: true,
          resizable: true
        }}
      />

      <div className="editable-data-grid-shortcuts">
        <small>
          Keyboard shortcuts: Ctrl+S (Save), Ctrl+N (Add), Ctrl+D/Del (Delete), Tab/Shift+Tab (Navigate), Enter (Edit), Esc (Cancel)
        </small>
      </div>
    </div>
  );
};

export default EditableDataGrid; 