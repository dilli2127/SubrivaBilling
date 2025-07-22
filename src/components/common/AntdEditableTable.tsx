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
  const lastEditingCellRef = useRef<{ row: number; col: number } | null>(null);

  // Prevent unnecessary state updates
  const setEditingCellSafely = (cell: { row: number; col: number } | null) => {
    const current = lastEditingCellRef.current;
    const newCell = cell;
    
    // Only update if the cell actually changed
    if (!current || !newCell || current.row !== newCell.row || current.col !== newCell.col) {
      lastEditingCellRef.current = newCell;
      setEditingCell(newCell);
    }
  };

  useEffect(() => {
    setData(dataSource);
  }, [dataSource]);

  // Global listener for dropdown selection
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if click is on a Select option
      if (target.closest('.ant-select-item-option')) {
        setTimeout(() => {
          const currentCell = document.activeElement?.closest('td');
          if (currentCell) {
            const currentRow = currentCell.closest('tr');
            
            // For product selection, move to quantity field
            if (currentCell.getAttribute('data-column-key') === 'product_id') {
              const qtyCell = currentRow?.querySelector('td[data-column-key="qty"]') as HTMLElement;
              if (qtyCell) {
                qtyCell.focus();
              }
            } else {
              const nextCell = currentCell.nextElementSibling as HTMLElement;
              nextCell?.focus();
            }
          }
        }, 400);
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Handle Enter key for Select option selection
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        const dropdownOpen = target.closest('.ant-select-dropdown');
        const selectOption = target.closest('.ant-select-item-option');
        
        if (dropdownOpen && selectOption) {
          // Enter was pressed on a Select option, handle navigation after selection
          setTimeout(() => {
            const currentCell = document.activeElement?.closest('td');
            if (currentCell) {
              const currentRow = currentCell.closest('tr');
              
              // For product selection, move to quantity field
              if (currentCell.getAttribute('data-column-key') === 'product_id') {
                const qtyCell = currentRow?.querySelector('td[data-column-key="qty"]') as HTMLElement;
                if (qtyCell) {
                  qtyCell.focus();
                }
              } else {
                const nextCell = currentCell.nextElementSibling as HTMLElement;
                nextCell?.focus();
              }
            }
          }, 300);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!enableAdvancedKeyboardNav) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only act if focus is inside this table
      if (!tableRef.current || !tableRef.current.contains(document.activeElement)) return;
      
      // Helper: get column keys
      const columnKeys = columns.map(col => col.dataIndex);
      const firstEditableCol = columns.find(col => col.editable !== false)?.dataIndex || columnKeys[0];
      
      // Helper: get current cell info
      const active = document.activeElement as HTMLElement;
      const currentCell = active?.closest('td');
      const currentColKey = currentCell?.getAttribute('data-column-key');
      const currentRow = currentCell?.closest('tr');
      const currentRowIndex = currentRow ? Array.from(currentRow.parentElement?.children || []).indexOf(currentRow) : -1;
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
        if (currentCell && currentColKey && currentRowIndex >= 0) {
          e.preventDefault();
          const colIdx = columnKeys.indexOf(currentColKey);
          let nextColIdx = e.shiftKey ? colIdx - 1 : colIdx + 1;
          let nextRowIndex = currentRowIndex;
          
          // Move to next/prev row if at end/start
          if (nextColIdx < 0) {
            nextColIdx = columnKeys.length - 1;
            nextRowIndex--;
          } else if (nextColIdx >= columnKeys.length) {
            nextColIdx = 0;
            nextRowIndex++;
            // If no next row, add new row if allowed
            if (nextRowIndex >= data.length && allowAdd && onAdd) {
              onAdd();
              setTimeout(() => {
                const rows = tableRef.current?.querySelectorAll('.ant-table-tbody tr');
                if (rows && rows.length > 0) {
                  const lastRow = rows[rows.length - 1];
                  const firstCell = lastRow.querySelector(`td[data-column-key="${firstEditableCol}"]`) as HTMLElement;
                  if (firstCell) {
                    firstCell.focus();
                    // Auto-start editing for the new row
                    const colIdx = columnKeys.indexOf(firstEditableCol);
                    setEditingCellSafely({ row: data.length, col: colIdx });
                  }
                }
              }, 200);
              return;
            }
          }
          
          // Focus next cell and auto-start editing
          const nextColKey = columnKeys[nextColIdx];
          const nextCell = tableRef.current?.querySelector(`.ant-table-tbody tr:nth-child(${nextRowIndex + 1}) td[data-column-key="${nextColKey}"]`) as HTMLElement;
          if (nextCell) {
            nextCell.focus();
            // Auto-start editing for the focused cell
            setEditingCellSafely({ row: nextRowIndex, col: nextColIdx });
          }
        }
      }
      // ArrowUp/ArrowDown navigation
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (currentCell && currentColKey && currentRowIndex >= 0) {
          e.preventDefault();
          let targetRowIndex = currentRowIndex;
          
          if (e.key === 'ArrowDown') {
            targetRowIndex++;
            if (targetRowIndex >= data.length && allowAdd && onAdd) {
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
            targetRowIndex--;
          }
          
          if (targetRowIndex >= 0 && targetRowIndex < data.length) {
            const cell = tableRef.current?.querySelector(`.ant-table-tbody tr:nth-child(${targetRowIndex + 1}) td[data-column-key="${currentColKey}"]`) as HTMLElement;
            if (cell) {
              cell.focus();
              // Auto-start editing for the focused cell
              const colIdx = columnKeys.indexOf(currentColKey);
              setEditingCellSafely({ row: targetRowIndex, col: colIdx });
            } else {
              // Fallback to first editable cell
              const fallback = tableRef.current?.querySelector(`.ant-table-tbody tr:nth-child(${targetRowIndex + 1}) td[data-column-key="${firstEditableCol}"]`) as HTMLElement;
              if (fallback) {
                fallback.focus();
                // Auto-start editing for the fallback cell
                const colIdx = columnKeys.indexOf(firstEditableCol);
                setEditingCellSafely({ row: targetRowIndex, col: colIdx });
              }
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

      // Navigate to next cell
      if (nextRow >= 0 && nextRow < data.length && nextCol >= 0 && nextCol < columns.length) {
        const nextCell = tableRef.current?.querySelector(`.ant-table-tbody tr:nth-child(${nextRow + 1}) td[data-column-key="${columns[nextCol].dataIndex}"]`) as HTMLElement;
        if (nextCell) {
          nextCell.focus();
          setEditingCellSafely({ row: nextRow, col: nextCol });
        }
      }
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  // Editable cell with support for different input types
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
    const [editing, setEditing] = useState(true);
    const column = columns[col];
    const inputRef = useRef<any>(null);

    useEffect(() => {
      setCellValue(value);
    }, [value]);

    useEffect(() => {
      // Auto-focus the input when cell becomes editable
      if (editing && inputRef.current) {
        // Use requestAnimationFrame for smoother focus
        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        });
      }
    }, [editing]);

    useEffect(() => {
      setCellValue(value);
    }, [value]);

    const handleChange = (newValue: any) => {
      setCellValue(newValue);
      saveCell(row, col, newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        setEditing(false);
        // Auto-navigate to next field
        setTimeout(() => {
          const currentCell = document.activeElement?.closest('td');
          if (currentCell) {
            const currentRow = currentCell.closest('tr');
            
            // For product selection, move to quantity field
            if (column.dataIndex === 'product_id') {
              const qtyCell = currentRow?.querySelector('td[data-column-key="qty"]') as HTMLElement;
              if (qtyCell) {
                qtyCell.focus();
              } else {
                const nextCell = currentCell.nextElementSibling as HTMLElement;
                nextCell?.focus();
              }
            } else {
              const nextCell = currentCell.nextElementSibling as HTMLElement;
              if (nextCell) {
                nextCell.focus();
              }
            }
          }
        }, 100);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        setEditing(false);
        // Let parent handle arrow navigation
      } else if (e.key === 'Escape') {
        setEditing(false);
        setCellValue(value); // Reset to original value
      }
    };

    const handleBlur = () => {
      setEditing(false);
    };

    let inputNode: React.ReactNode;

    switch (column.type) {
      case 'number':
        inputNode = (
          <InputNumber 
            ref={inputRef}
            value={cellValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            style={{ width: '100%' }}
            autoFocus
          />
        );
        break;
      case 'select':
        inputNode = (
          <Select
            ref={inputRef}
            value={cellValue}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ width: '100%' }}
            options={column.options}
            showSearch
            allowClear
            autoFocus
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onDropdownVisibleChange={(open) => {
              if (!open && cellValue) {
                // Auto-navigate when dropdown closes
                setTimeout(() => {
                  const currentCell = document.activeElement?.closest('td');
                  if (currentCell) {
                    const currentRow = currentCell.closest('tr');
                    
                    // For product selection, move to quantity field
                    if (column.dataIndex === 'product_id') {
                      const qtyCell = currentRow?.querySelector('td[data-column-key="qty"]') as HTMLElement;
                      if (qtyCell) {
                        qtyCell.focus();
                      } else {
                        const nextCell = currentCell.nextElementSibling as HTMLElement;
                        nextCell?.focus();
                      }
                    } else {
                      const nextCell = currentCell.nextElementSibling as HTMLElement;
                      if (nextCell) {
                        nextCell.focus();
                      }
                    }
                  }
                }, 300);
              }
            }}
            onSelect={(selectedValue) => {
              // Force navigation after selection
              setTimeout(() => {
                const currentCell = document.activeElement?.closest('td');
                if (currentCell) {
                  const currentRow = currentCell.closest('tr');
                  const rowKey = currentRow?.getAttribute('data-row-key');
                  
                  // Find the next editable field in the same row (skip stock_id)
                  const nextEditableCell = currentRow?.querySelector('td[data-column-key="qty"]') as HTMLElement;
                  if (nextEditableCell) {
                    nextEditableCell.focus();
                  } else {
                    // Fallback to next cell
                    const nextCell = currentCell.nextElementSibling as HTMLElement;
                    nextCell?.focus();
                  }
                }
              }, 500);
            }}
            onKeyDown={(e) => {
              // Custom key handler for Select
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                const selectElement = e.target as HTMLElement;
                const dropdownOpen = selectElement?.closest('.ant-select-dropdown');
                
                if (!dropdownOpen) {
                  // If dropdown is closed, handle arrow navigation
                  e.preventDefault();
                  e.stopPropagation();
                  handleKeyDown(e);
                }
              } else if (e.key === 'Enter') {
                const selectElement = e.target as HTMLElement;
                const dropdownOpen = selectElement?.closest('.ant-select-dropdown');
                
                if (dropdownOpen) {
                  // If dropdown is open, let Select handle Enter for option selection
                  // The onSelect will handle navigation after selection
                  return;
                } else {
                  // If dropdown is closed, open it
                  e.preventDefault();
                  const select = selectElement.closest('.ant-select-selector')?.parentElement as HTMLElement;
                  if (select) {
                    select.click();
                  }
                }
              }
            }}
          />
        );
        break;
      case 'date':
        inputNode = (
          <DatePicker
            ref={inputRef}
            value={cellValue ? dayjs(cellValue) : null}
            onChange={(date) => handleChange(date ? date.format('YYYY-MM-DD') : null)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            autoFocus
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
            onBlur={handleBlur}
            autoFocus
          />
        );
    }

    return (
      <div className="editable-cell-input-wrapper">
        {inputNode}
      </div>
    );
  };

  const mergedColumns = columns.map((col, colIndex) => ({
    ...col,
    onCell: (_record: any, rowIndex?: number) => ({
      onClick: () => {
        if (typeof rowIndex === "number") setEditingCell({ row: rowIndex, col: colIndex });
      },
      'data-column-key': col.dataIndex,
      tabIndex: 0,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (typeof rowIndex === "number") setEditingCellSafely({ row: rowIndex, col: colIndex });
        }
      },
      onFocus: () => {
        // Auto-start editing when cell is focused
        if (typeof rowIndex === "number") {
          setEditingCellSafely({ row: rowIndex, col: colIndex });
        }
      },
    }),
    render: (_value: any, record: any, rowIndex: number) => {
      const isEditing = editingCell && editingCell.row === rowIndex && editingCell.col === colIndex;
      
      if (isEditing) {
        return (
          <EditableCell
            key={`${rowIndex}-${colIndex}-${record[col.dataIndex]}`}
            row={rowIndex}
            col={colIndex}
            value={record[col.dataIndex]}
          />
        );
      }
      
      // Display value based on column type
      const value = record[col.dataIndex];
      if (value === null || value === undefined || value === '') {
        return <Text type="secondary" italic>Enter {col.title}</Text>;
      }
      
      switch (col.type) {
        case 'date':
          return value ? dayjs(value).format('YYYY-MM-DD') : '';
        case 'select':
          if (col.options) {
            const option = col.options.find(opt => opt.value === value);
            return option ? option.label : value;
          }
          return value;
        case 'number':
          return value;
        default:
          return value;
      }
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
