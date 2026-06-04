import { useMemo } from 'react';
import './LinkTypeCell.css';

function LinkTypeCell(props) {
	const { row, column, data } = props;

	const label = useMemo(() => {
		if (data) return data.label;
		return column.options.find(op => op.id === row.type)?.label || '';
	}, [data, column, row]);

	return (
		<div className="wx-wrapper wx-aadwz4ed">
			<div className="wx-text wx-aadwz4ed">{label}</div>
			{row && <i className="wxi-angle-down wx-aadwz4ed"></i>}
		</div>
	);
}

export default LinkTypeCell;
