import { addDays, format } from 'date-fns';
import './MyInclusiveEndTooltip.css';

const mask = 'dd-MM-yyyy';

function Row({ label, value }) {
  return (
    <div className="wx-row wx-aad9F2Sy">
      <span className="wx-label wx-aad9F2Sy">{label}:</span>
      <span className="wx-value wx-aad9F2Sy">{value}</span>
    </div>
  );
}

function MyInclusiveEndTooltip(props) {
  const { api, data } = props;

  // custom content gets the stored (exclusive) end, convert it here
  const shownEnd = (date) =>
    api.getState().inclusiveEnd ? addDays(date, -1) : date;

  if (data?.text) {
    return (
      <div className="data wx-aad9F2Sy">
        <div className="wx-row wx-aad9F2Sy">{data.text}</div>
      </div>
    );
  }

  if (data?.task) {
    const task = data.task;
    return (
      <div className="data wx-aad9F2Sy">
        <Row label="Name" value={task.text} />
        {task.start ? (
          <Row label="Start date" value={format(task.start, mask)} />
        ) : null}
        {task.end ? (
          <Row label="End date" value={format(shownEnd(task.end), mask)} />
        ) : null}
      </div>
    );
  }

  return null;
}

export default MyInclusiveEndTooltip;
