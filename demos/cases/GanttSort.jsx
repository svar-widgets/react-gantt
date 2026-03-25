import { useMemo } from 'react';
import { getData, zoomConfig } from '../data';
import { Gantt } from '../../src/';
import './GanttSort.css';

function GanttSort({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  function init(api) {
    api.intercept('sort-tasks', (config) => {
      return config.key === 'text';
    });
  }

  return (
    <div className="wx-fr1PMpDW demo">
      <h4>Sorting by the "Task Name" column only</h4>
      <div className="wx-fr1PMpDW gtcell">
        <Gantt
          init={init}
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          zoom={zoomConfig}
        />
      </div>
    </div>
  );
}

export default GanttSort;
