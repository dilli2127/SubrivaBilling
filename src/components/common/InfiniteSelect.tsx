import React from 'react';
import { Select } from 'antd';
import { InfiniteDropdownResult } from '../../hooks/useInfiniteDropdown';

const { Option } = Select;

interface InfiniteSelectProps {
  dropdown: InfiniteDropdownResult;
  placeholder?: string;
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
  allowClear?: boolean;
  style?: React.CSSProperties;
  renderOption?: (item: any) => { label: React.ReactNode; value: any; key: string };
  loadingText?: string;
  scrollText?: string;
  className?: string;
}

/**
 * Reusable Select component with infinite scroll and server-side search
 * 
 * @example
 * const categoryDropdown = useInfiniteDropdown({
 *   queryHook: apiSlice.useGetCategoryQuery,
 * });
 * 
 * <InfiniteSelect
 *   dropdown={categoryDropdown}
 *   placeholder="Select category"
 *   renderOption={(cat) => ({
 *     label: cat.category_name,
 *     value: cat._id,
 *     key: cat._id,
 *   })}
 * />
 */
export const InfiniteSelect: React.FC<InfiniteSelectProps & { mode?: 'multiple' | 'tags' }> = ({
  dropdown,
  placeholder = 'Select...',
  value,
  onChange,
  disabled = false,
  allowClear = true,
  style,
  renderOption,
  loadingText = 'Loading...',
  scrollText = 'Scroll for more',
  className,
  mode,
}) => {
  return (
    <Select
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      mode={mode}
      loading={dropdown.loading && dropdown.items.length === 0}
      showSearch
      allowClear={allowClear}
      onSearch={dropdown.setSearchString}
      onPopupScroll={dropdown.handlePopupScroll}
      onDropdownVisibleChange={dropdown.onDropdownVisibleChange}
      filterOption={false}
      disabled={disabled}
      style={style}
      className={className}
      dropdownRender={(menu) => (
        <>
          {menu}
          {dropdown.hasMore && dropdown.items.length > 0 && (
            <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
              {dropdown.loading ? loadingText : scrollText}
            </div>
          )}
        </>
      )}
    >
      {dropdown.items.map((item: any) => {
        if (renderOption) {
          const { label, value: optValue, key } = renderOption(item);
          return (
            <Option key={key} value={optValue}>
              {label}
            </Option>
          );
        }
        // Default fallback
        return (
          <Option key={item._id} value={item._id}>
            {item.name || item.label || item._id}
          </Option>
        );
      })}
    </Select>
  );
};

export default InfiniteSelect;

