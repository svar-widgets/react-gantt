import { useState } from 'react';
import { getData } from '../data';
import { Gantt } from '../../src/';
import { Slider, RadioButtonGroup, Field } from '@svar-ui/react-core';
import './GanttDisplayMode.css';

export default function GanttDisplayMode({ skinSettings }) {
	const data = getData();

	const [gridWidth, setGridWidth] = useState(400);
	const [displayMode, setDisplayMode] = useState('chart');
	const options = [
		{ id: 'all', label: 'All' },
		{ id: 'grid', label: 'Grid' },
		{ id: 'chart', label: 'Chart' },
	];

	return (
		<div className="rows wx-K3mN9pQr">
			<div className="bar wx-K3mN9pQr">
				<Field label="Display mode:" position={'left'}>
					<RadioButtonGroup
						options={options}
						value={displayMode}
						onChange={({ value }) => setDisplayMode(value)}
						type="inline"
					/>
				</Field>
				<Field label={`Grid width: ${gridWidth}`} position={'left'}>
					<Slider
						value={gridWidth}
						onChange={({ value }) => setGridWidth(value)}
						min={200}
						max={600}
						step={50}
					/>
				</Field>
			</div>

			<div className="gtcell wx-K3mN9pQr">
				<Gantt
					{...skinSettings}
					tasks={data.tasks}
					links={data.links}
					scales={data.scales}
					displayMode={displayMode}
					gridWidth={gridWidth}
				/>
			</div>
		</div>
	);
}
