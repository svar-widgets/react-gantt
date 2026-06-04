import { useState } from 'react';
import { getData } from '../data';
import { Gantt } from '../../src/';
import { Slider, RadioButtonGroup, Field, Button } from '@svar-ui/react-core';
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

	const [api, setApi] = useState();

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
				<div>
					<Field label="For test only(action):" position={'left'}>
						{['all', 'grid', 'chart'].map(mode => (
							<Button
								key={mode}
								onClick={() => api.exec('set-display-mode', { mode })}
							>
								{mode}
							</Button>
						))}
					</Field>
				</div>
			</div>

			<div className="gtcell wx-K3mN9pQr">
				<Gantt
					{...skinSettings}
					init={setApi}
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
