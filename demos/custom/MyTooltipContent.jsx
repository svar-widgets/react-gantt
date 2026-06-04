import { format } from 'date-fns';
import './MyTooltipContent.css';

function MyTooltipContent(props) {
  const { api, data } = props;

  const mask = 'yyyy.MM.dd';

  if (data?.task) {
    const task = data.task;
    return (
      <div className="data">
        <div className="text">
          <span className="caption">{task.type}: </span>
          {task.text}
        </div>
        <div className="text">
          <span className="caption">start: </span>
          {format(task.start, mask)}
        </div>
        {task.end ? (
          <div className="text">
            <span className="caption">end: </span>
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
          <span className="caption">predecessor: </span>
          {api.getTask(link.source).text}
        </div>
        <div className="text">
          <span className="caption">successor: </span>
          {api.getTask(link.target).text}
        </div>
      </div>
    );
  }

  if (data?.rollup) {
    const rollup = data.rollup;
    return (
      <div className="data">
        <div className="text">
          <span className="caption">{rollup.type}: </span>
          {rollup.text}
        </div>
        <div className="text">
          <span className="caption">start: </span>
          {format(rollup.start, mask)}
        </div>
        {rollup.end ? (
          <div className="text">
            <span className="caption">end: </span>
            {format(rollup.end, mask)}
          </div>
        ) : null}
      </div>
    );
  }

  return null;
}

export default MyTooltipContent;
