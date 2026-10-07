import { useMemo } from 'react';
import { getData } from '../data';
import { Gantt } from '../../src/';
import { Fullscreen } from '@svar-ui/react-core';
import './GanttFullscreen.css';

function GanttFullscreen({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  return (
    <div className="wx-0qqHrQ85 demo">
      <div className="wx-0qqHrQ85 hint">
        Click the "expand" icon, or click on Gantt and press Ctrl+Shift+F
      </div>
      <div className="wx-0qqHrQ85 gtcell">
        <Fullscreen hotkey="ctrl+shift+f">
          <Gantt {...skinSettings} tasks={data.tasks} links={data.links} />
        </Fullscreen>
      </div>
    </div>
  );
}

export default GanttFullscreen;
