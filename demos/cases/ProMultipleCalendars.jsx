import { useState } from 'react';
import { getData } from '../data';
import { Gantt, Editor } from '../../src/';
import { Field, Switch } from '@svar-ui/react-core';
import './ProMultipleCalendars.css';

export default function ProMultipleCalendars({ skinSettings }) {
	const { tasks, links, scales, calendars } = getData('calendars');
	const [api, setApi] = useState();

	const [enabled, setEnabled] = useState(false);
	const groupBy = enabled ? { field: 'duration' } : null;

	return (
		<div className="demo wx-T6yU3iO1">
			<div className="bar wx-T6yU3iO1">
				<Field label="Group by duration" position="left">
					<Switch
						value={enabled}
						onChange={({ value }) => setEnabled(value)}
					/>
				</Field>
				<div className="labels wx-T6yU3iO1">
					Wednesday off
					<div className="cell wednesday-off wx-T6yU3iO1"></div>
					Weekends only
					<div className="cell weekends-only wx-T6yU3iO1"></div>
					Part time
					<div className="cell part-time wx-T6yU3iO1"></div>
				</div>
			</div>
			<div className="gt-cell wx-T6yU3iO1">
				<Gantt
					{...skinSettings}
					init={setApi}
					groupBy={groupBy}
					calendars={calendars}
					calendar="default"
					tasks={tasks}
					links={links}
					scales={scales}
					cellWidth={60}
				/>
				{api && <Editor api={api} />}
			</div>
		</div>
	);
}
