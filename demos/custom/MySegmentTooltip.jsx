import { format } from 'date-fns';
import './MySegmentTooltip.css';

function MySegmentTooltip(props) {
  const { api, data } = props;

  const isSegment =
    data?.task?.segments && typeof data.segmentIndex === 'number';
  const values = isSegment ? data.task.segments[data.segmentIndex] : data.task;

  const mask = 'yyyy.MM.dd';

  if (data?.task) {
    const task = data.task;
    return (
      <div className="wx-aadYEI86 data">
        <div className="wx-aadYEI86 text">
          <span className="wx-aadYEI86 caption">{task.type}:</span>
          {task.text}
        </div>
        {isSegment ? (
          <div className="wx-aadYEI86 text">
            <span className="wx-aadYEI86 caption">segment:</span>
            {values?.text || ''}
          </div>
        ) : null}
        <div className="wx-aadYEI86 text">
          <span className="wx-aadYEI86 caption">start:</span>
          {format(values.start, mask)}
        </div>
        {values.end ? (
          <div className="wx-aadYEI86 text">
            <span className="wx-aadYEI86 caption">end:</span>
            {format(values.end, mask)}
          </div>
        ) : null}
      </div>
    );
  }

  if (data?.link) {
    const link = data.link;
    return (
      <div className="wx-aadYEI86 data">
        <div className="wx-aadYEI86 text">
          <span className="wx-aadYEI86 caption">predecessor:</span>
          {api.getTask(link.source).text}
        </div>
        <div className="wx-aadYEI86 text">
          <span className="wx-aadYEI86 caption">successor:</span>
          {api.getTask(link.target).text}
        </div>
      </div>
    );
  }

  return null;
}

export default MySegmentTooltip;
