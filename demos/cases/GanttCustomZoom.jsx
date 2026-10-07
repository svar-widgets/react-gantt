import { useMemo } from 'react';
import { getData, zoomConfig } from '../data';
import { Gantt } from '../../src/';
import './GanttCustomZoom.css';

const GanttCustomZoom = ({ skinSettings }) => {
  const data = useMemo(() => getData(), []);

  return (
    <div className="wx-6q6Giv9n demo">
      <div className="wx-6q6Giv9n hint">
        Point over Gantt chart, then hold Ctrl and use mouse wheel to zoom
      </div>
      <div className="wx-6q6Giv9n gtcell">
        <Gantt
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          zoom={zoomConfig}
        />
      </div>
    </div>
  );
};

export default GanttCustomZoom;
