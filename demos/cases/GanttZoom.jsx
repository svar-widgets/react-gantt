import { useMemo, useCallback } from 'react';
import { getData } from '../data';
import { Gantt } from '../../src/';
import './GanttZoom.css';

function GanttZoom({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const init = useCallback((api) => {
    api.on('zoom-scale', () => {
      console.log('The current zoom level is', api.getState().zoom);
    });
  }, []);

  return (
    <div className="wx-HQBKHlAu demo">
      <div className="wx-HQBKHlAu hint">
        Point over Gantt chart, then hold Ctrl and use mouse wheel to zoom
      </div>
      <div className="wx-HQBKHlAu gtcell">
        <Gantt
          init={init}
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          cellWidth={100}
          zoom
        />
      </div>
    </div>
  );
}

export default GanttZoom;
