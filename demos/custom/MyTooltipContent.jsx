import { format } from 'date-fns';
import './MyTooltipContent.css';

const mask = 'yyyy.MM.dd';

function Row({ label, value }) {
  return (
    <div className="wx-row wx-Kp3tQm7v">
      <span className="wx-label wx-Kp3tQm7v">{label}:</span>
      <span className="wx-value wx-Kp3tQm7v">{value}</span>
    </div>
  );
}

function MyTooltipContent(props) {
  const { api, data } = props;

  if (data?.text) {
    return (
      <div className="data wx-Kp3tQm7v">
        <div className="wx-row wx-Kp3tQm7v">{data.text}</div>
      </div>
    );
  }

  if (data?.task) {
    const task = data.task;
    return (
      <div className="data wx-Kp3tQm7v">
        <Row label="Name" value={task.text} />
        {task.start ? (
          <Row label="Start date" value={format(task.start, mask)} />
        ) : null}
        {task.end ? (
          <Row label="End date" value={format(task.end, mask)} />
        ) : null}
      </div>
    );
  }

  if (data?.link) {
    const link = data.link;
    return (
      <div className="data wx-Kp3tQm7v">
        <Row label="Predecessors" value={api.getTask(link.source).text} />
        <Row label="Successors" value={api.getTask(link.target).text} />
      </div>
    );
  }

  if (data?.rollup) {
    const rollup = data.rollup;
    return (
      <div className="data wx-Kp3tQm7v">
        <Row label="Name" value={rollup.text} />
        {rollup.start ? (
          <Row label="Start date" value={format(rollup.start, mask)} />
        ) : null}
        {rollup.end ? (
          <Row label="End date" value={format(rollup.end, mask)} />
        ) : null}
      </div>
    );
  }

  if (data?.sCurve) {
    const sCurve = data.sCurve;
    return (
      <div className="data wx-Kp3tQm7v">
        <Row label="Start date" value={format(sCurve.date, mask)} />
        {sCurve.lines.map((line) => (
          <div
            key={line.line}
            className={`wx-row wx-Kp3tQm7v${line.line === sCurve.hovered.line ? ' hovered' : ''}`}
          >
            <span className="wx-label wx-Kp3tQm7v">
              {line.type} by {line.metric}:
            </span>
            <span className="wx-value wx-Kp3tQm7v">
              {Math.round(line.value)}%
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (data?.deadline) {
    const task = data.deadline;
    return (
      <div className="data wx-Kp3tQm7v">
        <div className="text wx-Kp3tQm7v">
          <span className="caption wx-Kp3tQm7v">deadline: </span>
          {format(task.deadline, mask)}
        </div>
      </div>
    );
  }

  return null;
}

export default MyTooltipContent;
