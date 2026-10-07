import { useContext } from 'react';
import { getSegmentProgress } from '@svar-ui/gantt-store';
import { useStore } from '@svar-ui/lib-react';
import storeContext from '../../context';
import './BarSegments.css';

function BarSegments(props) {
  const { task, type } = props;

  const api = useContext(storeContext);
  const inactiveTasks = useStore(api, 'inactiveTasks');

  function segmentStyle(i) {
    const s = task.segments[i];
    return {
      left: `${s.$x}px`,
      top: '0px',
      width: `${s.$w}px`,
      height: '100%',
    };
  }

  return (
    <div className="wx-segments wx-GKbcLEGA">
      {task.segments.map((seg, i) => (
        <div
          key={i}
          className={`wx-segment wx-bar wx-${type} wx-GKbcLEGA${inactiveTasks && task.inactive ? ' wx-inactive' : ''}`}
          data-segment={i}
          style={segmentStyle(i)}
        >
          {task.progress ? (
            <div className="wx-progress-wrapper">
              <div
                className="wx-progress-percent wx-GKbcLEGA"
                style={{ width: `${getSegmentProgress(task, i)}%` }}
              ></div>
            </div>
          ) : null}
          <div className="wx-content">{seg.text || ''}</div>
        </div>
      ))}
    </div>
  );
}

export default BarSegments;
