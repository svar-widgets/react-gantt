import { useMemo, useState } from 'react';
import { getData } from '../data';
import { Gantt, ContextMenu, Editor, getDefaultColumns } from '../../src/';
import './ProWBS.css';

export default function ProWBS({ skinSettings }) {
	const data = useMemo(() => getData(), []);
	const [api, setApi] = useState();

	const columns = useMemo(() => getDefaultColumns({ wbs: true }), []);

	return (
		<div className="gtcell wx-E8mG5xN0">
			<ContextMenu api={api}>
				<Gantt
					init={setApi}
					{...skinSettings}
					tasks={data.tasks}
					links={data.links}
					scales={data.scales}
					columns={columns}
					gridWidth={550}
					zoom
					wbs
				/>
			</ContextMenu>
			{api && <Editor api={api} />}
		</div>
	);
}
