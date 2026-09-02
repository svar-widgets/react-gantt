import { useState, useEffect, useCallback, useMemo } from 'react';
import { ContextMenu, Editor, Gantt, getDefaultColumns } from '../../src/';
import { RestDataProvider } from '@svar-ui/gantt-data-provider';
import './ProResourcesProvider.css';

export default function ProResourcesProvider() {
	const restProvider = useMemo(
		() => new RestDataProvider('https://master--svar-gantt-go--dev.webix.io'),
		[],
	);

	const [api, setApi] = useState();
	const [tasks, setTasks] = useState([]);
	const [links, setLinks] = useState([]);
	const [resources, setResources] = useState([]);
	const [assignments, setAssignments] = useState([]);

	useEffect(() => {
		restProvider
			.getData(undefined, { resources: true, assignments: true })
			.then(response => {
				const { tasks: t, links: l, resources: r, assignments: a } = response;
				setTasks(t);
				setLinks(l);
				setResources(r);
				setAssignments(a);
			});
	}, [restProvider]);

	const init = useCallback(
		api => {
			setApi(api);

			api.setNext(restProvider);

			api.on('request-data', ev => {
				restProvider
					.getData(ev.id, { assignments: true })
					.then(({ tasks, links, assignments }) => {
						api.exec('provide-data', {
							id: ev.id,
							data: { tasks, links, assignments },
						});
					});
			});
		},
		[restProvider],
	);

	const columns = useMemo(() => getDefaultColumns({ resources: true }), []);

	return (
		<div className="demo wx-C6rE2yU1">
			<ContextMenu api={api}>
				<Gantt
					init={init}
					tasks={tasks}
					links={links}
					resources={resources}
					assignments={assignments}
					columns={columns}
				/>
			</ContextMenu>
			{api && <Editor api={api} />}
		</div>
	);
}
