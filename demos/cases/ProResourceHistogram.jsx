import { useMemo, useState } from 'react';
import { getData } from '../data';
import { Gantt, ResourceLoad, Tooltip, Editor } from '../../src/';
import MyResourceHistogramTooltip from '../custom/MyResourceHistogramTooltip.jsx';
import './ProResourceHistogram.css';

function ProResourceHistogram({ skinSettings }) {
  const data = useMemo(() => getData('resource-histogram'), []);
  const [api, setApi] = useState(null);

  return (
    <>
      <Tooltip api={api} content={MyResourceHistogramTooltip}>
        <div className="gantt wx-aaeadmJF">
          <Gantt
            {...skinSettings}
            tasks={data.tasks}
            links={data.links}
            scales={data.scales}
            resources={data.resources}
            assignments={data.assignments}
            calendars={data.calendars}
            calendar="standard"
            zoom
            init={setApi}
          />
        </div>
        <div className="resource wx-aaeadmJF">
          {api && <ResourceLoad api={api} mode="histogram" />}
        </div>
      </Tooltip>
      {api && <Editor api={api} />}
    </>
  );
}

export default ProResourceHistogram;
