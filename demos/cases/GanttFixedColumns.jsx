import { useMemo } from 'react';
import { getData } from '../data';
import { Gantt } from '../../src/';

export default function GanttFixedColumns(props) {
  const { skinSettings } = props;

  const data = useMemo(() => getData(), []);

  const columns = useMemo(
    () => [
      { id: 'text', header: 'Task name', width: 120 },
      {
        id: 'start',
        header: 'Start date',
        width: 120,
        align: 'center',
      },
      {
        id: 'duration',
        header: 'Duration',
        width: 90,
        align: 'center',
      },
      { id: 'add-task', header: 'Add task', width: 37, align: 'center' },
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
