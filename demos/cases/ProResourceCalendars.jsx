import { useState } from 'react';
import { getData } from '../data';
import { Gantt, ResourceLoad, Editor } from '../../src/';
import { Field, Switch } from '@svar-ui/react-core';
import './ProResourceCalendars.css';

export default function ProResourceCalendars({ skinSettings }) {
	const data = getData('calendars');

	const taskCalendar = {
		id: 'prototyping',
		css: 'prototyping',
		weekHours: {
			saturday: 8,
			sunday: 8,
			monday: 0,
			tuesday: 0,
			wednesday: 0,
			thursday: 0,
			friday: 0,
		},
	};

	const calendars = [...data.calendars, taskCalendar];

	const tasks = data.tasks.map(t => {
		const copy = { ...t };
		delete copy.calendar;
		if (t.id === 13) copy.calendar = 'prototyping';
		return copy;
	});

	const [api, setApi] = useState();
	const [enabled, setEnabled] = useState(true);

	const groupBy = enabled ? { field: 'resource' } : null;

	return (
		<div className="demo wx-aa3NQn6D">
			<div className="bar wx-aa3NQn6D">
				<Field label="Group by resource" position="left">
					<Switch
						value={enabled}
						onChange={({ value }) => setEnabled(value)}
					/>
				</Field>
				<div className="labels wx-aa3NQn6D">
					Wednesday off
					<div className="cell wednesday-off-resource wx-aa3NQn6D"></div>
					Weekends only
					<div className="cell weekends-only-resource wx-aa3NQn6D"></div>
					Part time
					<div className="cell part-time-resource wx-aa3NQn6D"></div>
					Weekends only (task)
					<div className="cell prototyping wx-aa3NQn6D"></div>
				</div>
			</div>

			<div className="main wx-aa3NQn6D">
				<div className="gantt wx-aa3NQn6D">
					<Gantt
						{...skinSettings}
						init={setApi}
						tasks={tasks}
						columns={data.columns}
						resources={data.resources}
						assignments={data.assignments}
						calendars={calendars}
						calendar="default"
						links={data.links}
						groupBy={groupBy}
						scales={data.scales}
						zoom
					/>
				</div>
				<div className="resource wx-aa3NQn6D">
					{api && (
						<ResourceLoad
							api={api}
							template={v => `${v.hours}h, ${v.percent}%`}
						/>
					)}
				</div>
				{api && <Editor api={api} />}
			</div>
		</div>
	);
}
