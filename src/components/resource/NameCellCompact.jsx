import { Avatar } from '@svar-ui/react-core';
import './NameCellCompact.css';

function NameCellCompact(props) {
	const { row, column } = props;

	const Cell = column._cell;

	return (
		<div className="wx-content wx-compact wx-aacXLb2S" data-tooltip={row.name}>
			<div className="wx-name wx-aacXLb2S">
				{Cell ? (
					<Cell row={row} column={column} />
				) : row.role ? (
					<div className="wx-avatar wx-aacXLb2S">
						<Avatar value={row} size={20} />
					</div>
				) : (
					row.name
				)}
			</div>
		</div>
	);
}

export default NameCellCompact;
