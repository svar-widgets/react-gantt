import { useContext, useMemo } from 'react';
import { Avatar, context } from '@svar-ui/react-core';
import { useStore } from '@svar-ui/lib-react';
import storeContext from '../../context';
import './GroupCellText.css';

function GroupCellText(props) {
	const { row } = props;

	const i18n = useContext(context.i18n);
	const _ = useMemo(() => i18n.getGroup('gantt'), [i18n]);

	const api = useContext(storeContext);
	const groupBy = useStore(api, 'groupBy');
	const resources = useStore(api, 'resources');

	const resourceData = useMemo(() => {
		if (groupBy?.field === 'resource') {
			let value = row.$groupValue;
			if (!Array.isArray(value)) value = [value];
			return value.map(id => resources.byId(id)).filter(Boolean);
		}
		return null;
	}, [groupBy, resources, row]);

	const ungroupLabel = useMemo(
		() => (groupBy?.field === 'resource' ? _('Unassigned') : _('Ungrouped')),
		[groupBy, _]
	);

	return (
		<div className="wx-group-text wx-aab2WKOu">
			{row.$groupValue === '$ungrouped' ? (
				ungroupLabel
			) : resourceData?.length ? (
				<>
					<Avatar value={resourceData} size={28}></Avatar>
					{resourceData.length === 1 && (
						<span className="wx-name wx-aab2WKOu">
							{resourceData[0].name}
						</span>
					)}
				</>
			) : (
				row.text
			)}
		</div>
	);
}

export default GroupCellText;
