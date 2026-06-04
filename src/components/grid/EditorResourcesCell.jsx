import { useMemo } from 'react';
import { Avatar } from '@svar-ui/react-core';

import './EditorResourcesCell.css';

function EditorResourcesCell(props) {
	const { data } = props;
	const count = useMemo(() => data.length, [data]);

	if (Array.isArray(data)) {
		return (
			<div className="wx-avatar-box wx-aaexf6PM">
				{count ? <Avatar value={data} size={28} /> : null}
			</div>
		);
	}

	return (
		<div className="wx-resource-option wx-aaexf6PM">
			<div className="wx-aaexf6PM">
				<Avatar value={data} size={28} />
			</div>
			<div className="wx-name wx-aaexf6PM">{data.name}</div>
		</div>
	);
}

export default EditorResourcesCell;
