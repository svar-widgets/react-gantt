import { dateToString } from '@svar-ui/lib-dom';
import { defaultConstraintTypes } from '@svar-ui/gantt-store';
import './MyConstraintTooltipContent.css';

const dateFormat = dateToString('%d.%m.%Y');
const constraintLabels = Object.fromEntries(
  defaultConstraintTypes.map((t) => [t.id, t.label]),
);

function constraintLabel(type) {
  return constraintLabels[type] || type;
}

function Row({ label, value }) {
  return (
    <div className="wx-row wx-aaedi5GZ">
      <span className="wx-label wx-aaedi5GZ">{label}:</span>
      <span className="wx-value wx-aaedi5GZ">{value}</span>
    </div>
  );
}

function MyConstraintTooltipContent({ api, data }) {
  if (data?.text) {
    return (
      <div className="data wx-aaedi5GZ">
        <div className="wx-row wx-aaedi5GZ">{data.text}</div>
      </div>
    );
  }

  if (data?.task) {
    const task = data.task;
    const c = task.constraint;
    return (
      <div className="data wx-aaedi5GZ">
        <Row label="Name" value={task.text} />
        {task.start ? (
          <Row label="Start date" value={dateFormat(task.start)} />
        ) : null}
        {task.end ? (
          <Row label="End date" value={dateFormat(task.end)} />
        ) : null}
        {c?.type ? (
          <>
            <Row
              label={constraintLabel(c.type)}
              value={c.date ? dateFormat(c.date) : ''}
            />
            {data.violated ? (
              <div className="wx-violated-row wx-aaedi5GZ">Violated</div>
            ) : null}
          </>
        ) : null}
      </div>
    );
  }

  if (data?.link) {
    const link = data.link;
    return (
      <div className="data wx-aaedi5GZ">
        <Row label="Predecessors" value={api.getTask(link.source).text} />
        <Row label="Successors" value={api.getTask(link.target).text} />
      </div>
    );
  }

  if (data?.deadline) {
    const deadlineTask = data.deadline;
    return (
      <div className="data wx-aaedi5GZ">
        {deadlineTask.deadline ? (
          <Row label="Deadline" value={dateFormat(deadlineTask.deadline)} />
        ) : null}
      </div>
    );
  }

  if (data?.constraint) {
    const c = data.constraint.constraint;
    return (
      <div className="data wx-aaedi5GZ">
        {c?.type ? (
          <Row
            label={constraintLabel(c.type)}
            value={c.date ? dateFormat(c.date) : ''}
          />
        ) : null}
        {data.violated ? (
          <div className="wx-violated-row wx-aaedi5GZ">Violated</div>
        ) : null}
      </div>
    );
  }

  return null;
}

export default MyConstraintTooltipContent;
