import { Avatar } from '@svar-ui/react-core';
import './NameCell.css';

function NameCell(props) {
	const { row, column } = props;

	function getStyle(row, col) {
		return {
			justifyContent: col.align,
			paddingLeft: `${(row.$level - 1) * 20}px`,
		};
	}

	const Cell = column._cell;

	return (
		<div className="wx-content wx-aadwWvd3" style={getStyle(row, column)}>
			{row.data ? (
				<i
					className={`wx-toggle-icon wxi-menu-${row.open ? 'down' : 'right'} wx-aadwWvd3`}
					data-action="open-resource-row"
				></i>
			) : (
				<i className="wx-toggle-placeholder wx-aadwWvd3"></i>
			)}
			<div className="wx-name wx-aadwWvd3">
				{Cell ? (
					<Cell row={row} column={column} />
				) : row.role ? (
					<div className="wx-avatar-name wx-aadwWvd3">
						<Avatar value={row} size={28} />
						<span className="wx-aadwWvd3">{row.name}</span>
					</div>
				) : (
					row.name
				)}
			</div>
		</div>
	);
}

export default NameCell;
