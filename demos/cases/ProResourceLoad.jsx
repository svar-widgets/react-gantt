import { useMemo, useState } from 'react';
import { getData, resources, assignments } from '../data';
import { Gantt, ResourceLoad, Tooltip, Editor } from '../../src/';
import MyTaskResourceTooltip from '../custom/MyTaskResourceTooltip.jsx';
import './ProResourceLoad.css';

function ProResourceLoad({ skinSettings }) {
  const data = useMemo(() => getData(), []);
  const [api, setApi] = useState(null);

  return (
    <Tooltip api={api} content={MyTaskResourceTooltip}>
      <div className="gantt wx-Y2gH8jL5">
        <Gantt
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          scales={data.scales}
          resources={resources}
          assignments={assignments}
          zoom
          init={setApi}
        />
      </div>
      <div className="resource wx-Y2gH8jL5">
        {api && <ResourceLoad api={api} />}
      </div>
      {api && <Editor api={api} />}
    </Tooltip>
  );
}

export default ProResourceLoad;
