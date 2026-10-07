import { format } from 'date-fns';
import './MyTaskResourceTooltip.css';

export default function MyTaskResourceTooltip({ api, data }) {
  const mask = 'yyyy.MM.dd';

  if (data?.task) {
    const task = data.task;
    return (
      <div className="wx-aaaJ20li data">
        <div className="wx-aaaJ20li text">
          <span className="wx-aaaJ20li caption">{task.type}:</span>
          {task.text}
        </div>
        <div className="wx-aaaJ20li text">
          <span className="wx-aaaJ20li caption">start:</span>
          {format(task.start, mask)}
        </div>
        {task.end ? (
          <div className="wx-aaaJ20li text">
            <span className="wx-aaaJ20li caption">end:</span>
            {format(task.end, mask)}
          </div>
        ) : null}
      </div>
    );
  }

  if (data?.link) {
    const link = data.link;
    return (
      <div className="wx-aaaJ20li data">
        <div className="wx-aaaJ20li text">
          <span className="wx-aaaJ20li caption">predecessor:</span>
          {api.getTask(link.source).text}
        </div>
        <div className="wx-aaaJ20li text">
          <span className="wx-aaaJ20li caption">successor:</span>
          {api.getTask(link.target).text}
        </div>
      </div>
    );
  }

  if (data?.resource) {
    const resource = data.resource;
    return (
      <div className="wx-aaaJ20li data">
        <div className="wx-aaaJ20li text">
          <span className="wx-aaaJ20li caption">Name:</span>
          {resource.name}
        </div>
        <div className="wx-aaaJ20li text">
          <span className="wx-aaaJ20li caption">Total:</span>
          {resource.$total}h
        </div>
        <div className="wx-aaaJ20li text">
          <span className="wx-aaaJ20li caption">Overloaded:</span>
          {resource.$overloaded}
        </div>
      </div>
    );
  }

  return null;
}
