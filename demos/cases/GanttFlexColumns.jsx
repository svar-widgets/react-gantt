import { useMemo } from 'react';
import { getData } from '../data';
import { Gantt } from '../../src/';

function GanttFlexColumns({ skinSettings }) {
  const data = useMemo(() => getData(), []);

  const columns = useMemo(
    () => [
      { id: 'text', header: 'Task name', flexgrow: 2 },
      {
        id: 'start',
        header: 'Start date',
        flexgrow: 1,
        align: 'center',
      },
      {
        id: 'duration',
        header: 'Duration',
        align: 'center',
        flexgrow: 1,
      },
      {
        id: 'add-task',
        header: 'Add task',
        width: 37,
        align: 'center',
      },
    ],
    [],
  );

  return (
    <Gantt
      {...skinSettings}
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
      columns={columns}
    />
  );
}

export default GanttFlexColumns;
