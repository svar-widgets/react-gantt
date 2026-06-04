import { format } from 'date-fns';
import './MyTaskResourceTooltip.css';

export default function MyTaskResourceTooltip({ api, data }) {
	const mask = 'yyyy.MM.dd';

	if (data?.task) {
		const task = data.task;
		return (
			<div className="data">
				<div className="text">
					<span className="caption">{task.type}:</span>
					{task.text}
				</div>
				<div className="text">
					<span className="caption">start:</span>
					{format(task.start, mask)}
				</div>
				{task.end ? (
					<div className="text">
						<span className="caption">end:</span>
						{format(task.end, mask)}
					</div>
				) : null}
			</div>
		);
	}

	if (data?.link) {
		const link = data.link;
		return (
			<div className="data">
				<div className="text">
					<span className="caption">predecessor:</span>
					{api.getTask(link.source).text}
				</div>
				<div className="text">
					<span className="caption">successor:</span>
					{api.getTask(link.target).text}
				</div>
			</div>
		);
	}

	if (data?.resource) {
		const resource = data.resource;
		return (
			<div className="data">
				<div className="text">
					<span className="caption">Name:</span>
					{resource.name}
				</div>
				<div className="text">
					<span className="caption">Total:</span>
					{resource.$total}h
				</div>
				<div className="text">
					<span className="caption">Overloaded:</span>
					{resource.$overloaded}
				</div>
			</div>
		);
	}

	return null;
}
