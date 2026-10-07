import { useMemo, useState } from 'react';
import { getData } from '../data';
import { Gantt, Editor, Toolbar } from '../../src';
import { Button } from '@svar-ui/react-core';
import './ProUnscheduledTasks.css';

const columns = [
  {
    id: 'text',
    header: 'Task name',
    width: 170,
    sort: true,
  },
  {
    id: 'start',
    header: 'Start date',
    width: 120,
    align: 'center',
    sort: true,
    editor: 'datepicker',
  },
  {
    id: 'duration',
    header: 'Duration',
    width: 80,
    sort: true,
    align: 'center',
    editor: 'text',
  },
  {
    id: 'unscheduled',
    header: '',
    width: 40,
    align: 'center',
    template: (v) => (v ? 'yes' : 'no'),
  },
  { id: 'add-task', header: 'Add task', width: 37, align: 'center' },
];

function ProUnscheduledTasks({ skinSettings }) {
  const [api, setApi] = useState(null);

  const data = useMemo(() => getData('day', { unscheduledTasks: true }), []);

  return (
    <>
      <div className="wx-aact1Rjt topbar">
        <Toolbar api={api} />
        <Button
          type="primary"
          onClick={() =>
            api.exec('update-task', { id: 10, task: { start: null } })
          }
        >
          Unschedule task: 10
        </Button>
      </div>
      <div className="wx-aact1Rjt gtcell">
        <Gantt
          init={setApi}
          {...skinSettings}
          tasks={data.tasks}
          links={data.links}
          scales={data.scales}
          unscheduledTasks={true}
          columns={columns}
          undo={true}
        />
        {api && <Editor api={api} />}
      </div>
    </>
  );
}

export default ProUnscheduledTasks;
