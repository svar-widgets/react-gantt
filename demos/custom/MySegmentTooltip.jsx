import { format } from 'date-fns';
import './MySegmentTooltip.css';

function MySegmentTooltip(props) {
  const { api, data } = props;

  const isSegment = data?.task?.segments && typeof data.segmentIndex === 'number';
  const values = isSegment ? data.task.segments[data.segmentIndex] : data.task;

  const mask = 'yyyy.MM.dd';

  if (data?.task) {
    const task = data.task;
    return (
      <div className="data">
        <div className="text">
          <span className="caption">{task.type}:</span>
          {task.text}
        </div>
        {isSegment ? (
          <div className="text">
            <span className="caption">segment:</span>
            {values?.text || ''}
          </div>
        ) : null}
        <div className="text">
          <span className="caption">start:</span>
          {format(values.start, mask)}
        </div>
        {values.end ? (
          <div className="text">
            <span className="caption">end:</span>
            {format(values.end, mask)}
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

  return null;
}

export default MySegmentTooltip;
