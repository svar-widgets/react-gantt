import { useState, useMemo } from 'react';
import { getData } from '../data';
import { Gantt, ContextMenu } from '../../src/index.js';
import { Button } from '@svar-ui/react-core';
import './GanttFilterInline.css';

function GanttFilterInline({ skinSettings }) {
  const data = useMemo(() => getData(), []);
  const [api, setApi] = useState(null);
  const [tasks, setTasks] = useState([...data.tasks]);

  function reload() {
    const next = [...data.tasks];
    next.pop();
    setTasks(next);
  }

  function clear() {
    api.exec('filter-tasks', {});
  }

  const textfilter = { filter: { type: 'text', config: { clear: true } } };
  const datefilter = {
    filter: { type: 'datepicker', config: { format: '%d-%m-%Y' } },
  };
  const numberfilter = {
    filter: {
      type: 'text',
      config: {
        clear: true,
        handler: (a, b) => !b || a === b * 1,
      },
    },
  };

  const columns = useMemo(
    () => [
      { id: 'text', header: ['Task name', textfilter], width: 200 },
      {
        id: 'start',
        header: ['Start date', datefilter],
        align: 'center',
        width: 130,
      },
      {
        id: 'end',
        header: ['End date', datefilter],
        align: 'center',
        width: 130,
      },
      {
        id: 'duration',
        header: ['Duration', numberfilter],
        width: 100,
        align: 'center',
      },
      { id: 'add-task', header: 'Add task', align: 'center' },
    ],
    []
  );

  return (
    <div className="demo wx-aact7T2K">
      <div className="bar wx-aact7T2K">
        <Button type="primary" onClick={reload}>
          Reload
        </Button>
        <Button type="primary" onClick={clear}>
          Clear filters
        </Button>
      </div>
      <div className="gtcell wx-aact7T2K">
        <ContextMenu api={api}>
          <Gantt
            init={setApi}
            {...skinSettings}
            tasks={tasks}
            columns={columns}
            links={data.links}
            scales={data.scales}
            zoom
          />
        </ContextMenu>
      </div>
    </div>
  );
}

export default GanttFilterInline;
