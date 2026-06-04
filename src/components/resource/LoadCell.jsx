import { getValue } from '@svar-ui/grid-store';
import { setID } from '@svar-ui/lib-dom';

function LoadCell(props) {
	const { row, column } = props;

	return (
		<div className="wx-aadMkg5o" data-resource-id={setID(row.id)}>
			{column.template(getValue(row, column))}
		</div>
	);
}

export default LoadCell;
