import React, { useMemo } from 'react';
import { Input, Switch, Tag } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';

interface BusinessType extends Record<string, any> {
	_id: string;
	name: string;
	code: string;
	active?: boolean;
}

const BusinessTypeCrud: React.FC = () => {
	const config = useMemo(() => ({
		title: 'Business Types',
		columns: [
			{
				title: 'Name',
				dataIndex: 'name',
				key: 'name',
				render: (text: string) => <strong>{text}</strong>,
			},
			{
				title: 'Code',
				dataIndex: 'code',
				key: 'code',
			},
			{
				title: 'Active',
				dataIndex: 'active',
				key: 'active',
				render: (isActive: boolean) =>
					isActive ? (
						<Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">
							Yes
						</Tag>
					) : (
						<Tag color="default">No</Tag>
					),
			},
		],
		formItems: [
			{
				label: 'Name',
				name: 'name',
				rules: [{ required: true, message: 'Please enter business type name!' }],
				component: <Input placeholder="Enter business type name" />,
			},
			{
				label: 'Code',
				name: 'code',
				rules: [{ required: true, message: 'Please enter unique code!' }],
				component: <Input placeholder="Enter unique code" />,
			},
			{
				label: 'Active',
				name: 'active',
				valuePropName: 'checked',
				component: <Switch checkedChildren="Yes" unCheckedChildren="No" defaultChecked />,
			},
		],
		entityName: 'BusinessType',
		formColumns: 2,
		canEdit: (_record: BusinessType) => true,
		canDelete: (_record: BusinessType) => true,
	}), []);

	return (
		<GenericCrudPage
			config={config}
			enableDynamicFields={true}
			entityName="businesstype"
		/>
	);
};

export default BusinessTypeCrud;


