import React from 'react';
import { apiSlice } from '../../services/redux/api/apiSlice';
import { useInfiniteDropdown } from '../../hooks/useInfiniteDropdown';
import { InfiniteSelect } from './InfiniteSelect';

interface BusinessTypeSelectProps {
	placeholder?: string;
	allowClear?: boolean;
	showSearch?: boolean;
	value?: any;
	onChange?: (value: any) => void;
	multiple?: boolean;
	style?: React.CSSProperties;
	className?: string;
	disabled?: boolean;
}

/**
 * Select component that loads Business Types from API.
 * Uses RTK Query dynamic endpoint: useGetBusinessTypeQuery
 */
export const BusinessTypeSelect: React.FC<BusinessTypeSelectProps> = ({
	placeholder = 'Select business type',
	allowClear = true,
	showSearch = true,
	value,
	onChange,
	multiple = false,
	style,
	className,
	disabled = false,
}) => {
	const dropdown = useInfiniteDropdown({
		queryHook: (apiSlice as any).useGetBusinessTypeQuery,
		limit: 20,
		searchDebounceMs: 300,
	});

	return (
		<InfiniteSelect
			dropdown={dropdown}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			allowClear={allowClear}
			style={style}
			className={className}
			disabled={disabled}
			mode={multiple ? 'multiple' : undefined}
			renderOption={(bt: any) => ({
				label: bt.name ?? bt.label ?? '',
				value: bt.code ?? bt.label ?? bt._id,
				key: bt._id ?? bt.name ?? bt.label,
			})}
			loadingText="Loading types..."
			scrollText="Scroll for more"
		/>
	);
};

export default BusinessTypeSelect;


