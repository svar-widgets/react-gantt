import { useCallback, useEffect, useRef } from 'react';
import { Grid } from '@svar-ui/react-grid';
import { locateID } from '@svar-ui/lib-dom';
import './GridSection.css';

function GridSection(props) {
	const { columns, data, onAction, onEdit, sizes, onInit } = props;

	const onActionRef = useRef(onAction);
	const onEditRef = useRef(onEdit);
	const onInitRef = useRef(onInit);

	useEffect(() => {
		onActionRef.current = onAction;
		onEditRef.current = onEdit;
		onInitRef.current = onInit;
	}, [onAction, onEdit, onInit]);

	function onClick(e) {
		const id = locateID(e);
		const action = e.target.dataset.action;
		if (action) e.preventDefault();
		if (id && action) onActionRef.current?.(id, action);
	}

	const init = useCallback((tApi) => {
		onInitRef.current?.(tApi);
		tApi.on('update-cell', (ev) => {
			const { id, column, value } = ev;
			onEditRef.current?.(id, column, value);
		});
	}, []);

	return (
		<div className="wx-table wx-aaadQkXy" onClick={onClick}>
			<Grid
				init={init}
				columns={columns}
				data={data}
				select={false}
				columnStyle={col =>
					`wx-editor-cell wx-text-${col.align} ${col.id === 'delete' ? 'wx-action' : ''}`}
				sizes={sizes || {}}
			/>
		</div>
	);
}

export default GridSection;
