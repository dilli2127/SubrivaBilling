import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Space,
  message,
  Modal,
  Form,
  Typography
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnType } from 'antd/es/table';
import './AntdEditableTable.css';

const { Text } = Typography;

export interface AntdEditableColumn {
  key: string;
  title: string;
  dataIndex: string;
  type?: 'text' | 'number' | 'select' | 'date' | 'boolean';
  options?: Array<{ label: string; value: any }>;
  required?: boolean;
  editable?: boolean;
  width?: number | string;
  validation?: (value: any) => string | null;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  dataIndex: string;
  title: any;
  inputType: 'text' | 'number' | 'select' | 'date' | 'boolean';
  record: any;
  index: number;
  options?: Array<{ label: string; value: any }>;
  onCellChange: (record: any, dataIndex: string, value: any) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  dataIndex,
  title,
  inputType,
  record,
  index,
  options,
  onCellChange,
  children,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(record?.[dataIndex] || '');

  const handleChange = (newValue: any) => {
    setValue(newValue);
    if (record && onCellChange) {
      onCellChange(record, dataIndex, newValue);
      
      // Auto-navigate to next field after selection
      if (inputType === 'select' && newValue) {
        setTimeout(() => {
          const currentCell = document.activeElement?.closest('td');
          if (currentCell) {
            const nextCell = currentCell.nextElementSibling as HTMLElement;
            if (nextCell) {
              nextCell.focus();
            }
          }
        }, 200);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // For Select components, only handle arrow keys when dropdown is closed
    if (inputType === 'select') {
      const selectElement = e.target as HTMLElement;
      const dropdownOpen = selectElement?.closest('.ant-select-dropdown');
      
      if (dropdownOpen) {
        // Let Select handle arrow keys when dropdown is open
        return;
      }
    }
    
    if (e.key === 'Enter' || e.key === 'Tab') {
      setEditing(false);
      
      // Auto-navigate to next field
      setTimeout(() => {
        const currentCell = document.activeElement?.closest('td');
        if (currentCell) {
          const nextCell = currentCell.nextElementSibling as HTMLElement;
          if (nextCell) {
            nextCell.focus();
          }
        }
      }, 50);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      setEditing(false);
      
      // Move to next row
      setTimeout(() => {
        const currentCell = document.activeElement?.closest('td');
        if (currentCell) {
          const currentRow = currentCell.closest('tr');
          const nextRow = currentRow?.nextElementSibling as HTMLElement;
          if (nextRow) {
            // Find the same column in the next row
            const sameColumnCell = nextRow.querySelector(`td[data-column-key="${dataIndex}"]`) as HTMLElement;
            if (sameColumnCell) {
              sameColumnCell.focus();
            } else {
              // Fallback: find first editable cell in next row
              const firstEditableCell = nextRow.querySelector('td[data-column-key="product_id"]') as HTMLElement;
              firstEditableCell?.focus();
            }
          }
        }
      }, 100);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      setEditing(false);
      
      // Move to previous row
      setTimeout(() => {
        const currentCell = document.activeElement?.closest('td');
        if (currentCell) {
          const currentRow = currentCell.closest('tr');
          const prevRow = currentRow?.previousElementSibling as HTMLElement;
          if (prevRow) {
            // Find the same column in the previous row
            const sameColumnCell = prevRow.querySelector(`td[data-column-key="${dataIndex}"]`) as HTMLElement;
            if (sameColumnCell) {
              sameColumnCell.focus();
            } else {
              // Fallback: find first editable cell in previous row
              const firstEditableCell = prevRow.querySelector('td[data-column-key="product_id"]') as HTMLElement;
              firstEditableCell?.focus();
            }
          }
        }
      }, 100);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      setEditing(false);
      
      // Move to next column
      setTimeout(() => {
        const currentCell = document.activeElement?.closest('td');
        if (currentCell) {
          const nextCell = currentCell.nextElementSibling as HTMLElement;
          if (nextCell) {
            nextCell.focus();
          }
        }
      }, 50);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      setEditing(false);
      
      // Move to previous column
      setTimeout(() => {
        const currentCell = document.activeElement?.closest('td');
        if (currentCell) {
          const prevCell = currentCell.previousElementSibling as HTMLElement;
          if (prevCell) {
            prevCell.focus();
          }
        }
      }, 50);
    } else if (e.key === 'Escape') {
      setEditing(false);
      setValue(record?.[dataIndex] || ''); // Reset to original value
    }
  };

  const handleBlur = () => {
    setEditing(false);
  };

  let inputNode: React.ReactNode;

  switch (inputType) {
    case 'number':
      inputNode = (
        <InputNumber 
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{ width: '100%' }}
          autoFocus={editing}
        />
      );
      break;
    case 'select':
      inputNode = (
        <Select
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{ width: '100%' }}
          options={options}
          showSearch
          allowClear
          autoFocus={editing}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          onDropdownVisibleChange={(open) => {
            if (!open && value) {
              // Auto-navigate when dropdown closes
              setTimeout(() => {
                const currentCell = document.activeElement?.closest('td');
                if (currentCell) {
                  const nextCell = currentCell.nextElementSibling as HTMLElement;
                  if (nextCell) {
                    nextCell.focus();
                  }
                }
              }, 200);
            }
          }}
          onSelect={(selectedValue) => {
            // Force navigation after selection
            setTimeout(() => {
              const currentCell = document.activeElement?.closest('td');
              if (currentCell) {
                const nextCell = currentCell.nextElementSibling as HTMLElement;
                if (nextCell) {
                  nextCell.focus();
                }
              }
            }, 300);
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
            }
          }}
        />
      );
      break;
    case 'date':
      inputNode = (
        <DatePicker
          value={value ? dayjs(value) : null}
          onChange={(date) => handleChange(date ? date.format('YYYY-MM-DD') : null)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{ width: '100%' }}
          format="YYYY-MM-DD"
          autoFocus={editing}
        />
      );
      break;
    case 'boolean':
      inputNode = (
        <Select
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{ width: '100%' }}
          options={[
            { label: 'Yes', value: true },
            { label: 'No', value: false }
          ]}
          autoFocus={editing}
        />
      );
      break;
    default:
      inputNode = (
        <Input 
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoFocus={editing}
        />
      );
  }

  return (
    <td {...restProps}>
      {editing ? (
        <div className="editable-cell-input-wrapper">
          {inputNode}
        </div>
      ) : (
        <div 
          className="editable-cell-content"
          onClick={() => setEditing(true)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              setEditing(true);
            }
          }}
        >
          {children || <span style={{ color: '#999', fontStyle: 'italic' }}>Click to edit</span>}
        </div>
      )}
    </td>
  );
};

interface AntdEditableTableProps {
  columns: AntdEditableColumn[];
  dataSource: any[];
  onSave: (data: any[]) => void;
  onAdd?: () => void;
  onDelete?: (indices: number[]) => void;
  allowAdd?: boolean;
  allowDelete?: boolean;
  allowEdit?: boolean;
  loading?: boolean;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  pagination?: boolean;
  rowKey?: string;
}

const AntdEditableTable: React.FC<AntdEditableTableProps> = ({
  columns,
  dataSource,
  onSave,
  onAdd,
  onDelete,
  allowAdd = true,
  allowDelete = true,
  allowEdit = true,
  loading = false,
  className = '',
  size = 'small',
  pagination = false,
  rowKey = 'key'
}) => {
  const [data, setData] = useState<any[]>(dataSource);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    // Add keys to data if they don't exist
    const dataWithKeys = dataSource.map((item, index) => ({
      ...item,
      [rowKey]: item[rowKey] || index.toString()
    }));
    setData(dataWithKeys);
  }, [dataSource, rowKey]);

  const handleCellChange = (record: any, dataIndex: string, value: any) => {
    if (!record || !dataIndex) return;
    
    const newData = [...data];
    const index = newData.findIndex(item => record[rowKey] === item[rowKey]);
    
    if (index > -1) {
      newData[index] = { ...newData[index], [dataIndex]: value };
      setData(newData);
      onSave(newData);
    }
  };

  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    } else {
      const newData: any = {
        [rowKey]: Date.now().toString(),
      };
      
      columns.forEach(col => {
        if (col.type === 'number') {
          newData[col.dataIndex] = 0;
        } else if (col.type === 'boolean') {
          newData[col.dataIndex] = false;
        } else {
          newData[col.dataIndex] = '';
        }
      });
      
      setData([...data, newData]);
    }
  };

  const handleDelete = (keys: React.Key[]) => {
    Modal.confirm({
      title: 'Delete Items',
      content: `Are you sure you want to delete ${keys.length} item(s)?`,
      onOk: () => {
        if (onDelete) {
          const indices = keys.map(key => 
            data.findIndex(item => item[rowKey] === key)
          );
          onDelete(indices);
        } else {
          const newData = data.filter(item => !keys.includes(item[rowKey]));
          setData(newData);
          onSave(newData);
        }
        setSelectedRowKeys([]);
      }
    });
  };

  const renderCell = (text: any, record: any, dataIndex: string, column: AntdEditableColumn) => {
    if (!record || !column) return null;
    
    if (text === null || text === undefined || text === '') {
      return <Text type="secondary" italic>Enter {column.title}</Text>;
    }
    
    switch (column.type) {
      case 'date':
        return text ? dayjs(text).format('YYYY-MM-DD') : '';
      case 'boolean':
        return text ? 'Yes' : 'No';
      case 'select':
        if (column.options) {
          const option = column.options.find(opt => opt.value === text);
          return option ? option.label : text;
        }
        return text;
      default:
        return text;
    }
  };

  const mergedColumns: ColumnType<any>[] = columns.map(col => ({
    ...col,
    title: col.title,
    dataIndex: col.dataIndex,
    width: col.width,
    onCell: (record: any) => ({
      record,
      inputType: col.type || 'text',
      dataIndex: col.dataIndex,
      title: col.title,
      options: col.options,
      onCellChange: handleCellChange
    }),
    render: (text: any, record: any) => renderCell(text, record, col.dataIndex, col)
  }));

  // Add action column (simplified for continuous edit mode)
  if (allowDelete) {
    mergedColumns.push({
      title: 'Actions',
      dataIndex: 'actions',
      width: 80,
      render: (_, record: any) => (
        <Button
          type="link"
          danger
          onClick={() => handleDelete([record[rowKey]])}
          size="small"
          icon={<DeleteOutlined />}
        >
          Delete
        </Button>
      )
    });
  }

  const rowSelection = allowDelete ? {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  } : undefined;

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            onSave(data);
            break;
          case 'n':
            if (allowAdd) {
              e.preventDefault();
              handleAdd();
            }
            break;
          case 'd':
            if (allowDelete && selectedRowKeys.length > 0) {
              e.preventDefault();
              handleDelete(selectedRowKeys);
            }
            break;
        }
      } else if (e.key === 'Delete' && allowDelete && selectedRowKeys.length > 0) {
        e.preventDefault();
        handleDelete(selectedRowKeys);
      }
      
      // Arrow key navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const target = e.target as HTMLElement;
        if (target.closest('.ant-table-tbody')) {
          e.preventDefault();
          
          const currentCell = target.closest('td');
          if (!currentCell) return;
          
          const currentRow = currentCell.closest('tr');
          if (!currentRow) return;
          
          const allRows = Array.from(document.querySelectorAll('.ant-table-tbody tr'));
          const currentRowIndex = allRows.indexOf(currentRow);
          const currentCellIndex = Array.from(currentRow.children).indexOf(currentCell);
          
          let nextCell: HTMLElement | null = null;
          
          switch (e.key) {
            case 'ArrowUp':
              if (currentRowIndex > 0) {
                const prevRow = allRows[currentRowIndex - 1];
                nextCell = prevRow.children[currentCellIndex] as HTMLElement;
              }
              break;
            case 'ArrowDown':
              if (currentRowIndex < allRows.length - 1) {
                const nextRow = allRows[currentRowIndex + 1];
                nextCell = nextRow.children[currentCellIndex] as HTMLElement;
              }
              break;
            case 'ArrowLeft':
              if (currentCellIndex > 0) {
                nextCell = currentRow.children[currentCellIndex - 1] as HTMLElement;
              }
              break;
            case 'ArrowRight':
              if (currentCellIndex < currentRow.children.length - 1) {
                nextCell = currentRow.children[currentCellIndex + 1] as HTMLElement;
              }
              break;
          }
          
          if (nextCell) {
            nextCell.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRowKeys, data, allowAdd, allowDelete]);

  return (
    <div className={`antd-editable-table ${className}`}>
      <div className="table-toolbar">
        <Space>
          {allowAdd && (
            <Button
              type="primary"
              onClick={handleAdd}
              icon={<PlusOutlined />}
              size="small"
            >
              Add Row (Ctrl+N)
            </Button>
          )}
          {allowDelete && selectedRowKeys.length > 0 && (
            <Button
              danger
              onClick={() => handleDelete(selectedRowKeys)}
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete Selected (Del)
            </Button>
          )}
          <Button
            type="primary"
            onClick={() => onSave(data)}
            icon={<SaveOutlined />}
            size="small"
            loading={loading}
          >
            Save (Ctrl+S)
          </Button>
        </Space>
        
        <div className="table-info">
          <Text type="secondary">
            {selectedRowKeys.length > 0 && `${selectedRowKeys.length} selected | `}
            Total: {data.length} items
          </Text>
        </div>
      </div>

      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowSelection={rowSelection}
        pagination={pagination ? undefined : false}
        loading={loading}
        size={size}
        className={className}
        rowKey={rowKey}
        scroll={{ x: true }}
      />

      <div className="keyboard-shortcuts">
        <Text type="secondary">
          Keyboard shortcuts: Ctrl+S (Save), Ctrl+N (Add), Ctrl+D/Del (Delete), Click/Enter (Edit), Tab/Arrow Keys (Navigate), Esc (Cancel)
        </Text>
      </div>
    </div>
  );
};

export default AntdEditableTable; 