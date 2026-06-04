import { useMemo } from 'react';
import { Avatar } from '@svar-ui/react-core';
import './ResourcesEditorCell.css';

function ResourcesEditorCell(props) {
	const { row, data } = props;

	const item = useMemo(() => data || row, [data, row]);

	if (!item) return null;

	return (
		<>
			<div className="wx-avatar wx-aadUoSB7">
				<Avatar value={item} size={40} />
			</div>
			<div className="wx-text wx-aadUoSB7">
				<div className="wx-name wx-aadUoSB7">{item.name}</div>
				{item.role ? (
					<div className="wx-role wx-aadUoSB7">{item.role}</div>
				) : null}
			</div>
		</>
	);
}

export default ResourcesEditorCell;
